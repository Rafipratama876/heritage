<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Minimal Google Analytics Data API (GA4) client — pulls the same kind of
 * summary metrics as the local /visitors insight, but sourced from GA4
 * instead of our own page_views table. Ported from the old backend's
 * backend/src/lib/ga4.ts, which used the official Node client library;
 * here we talk to the REST API directly (service-account JWT -> OAuth2
 * access token -> POST :runReport) so no extra Google SDK dependency is
 * needed — just PHP's built-in openssl for the RS256 JWT signature.
 *
 * Credentials come from the service account JSON key you downloaded for
 * this GA4 property — don't paste the whole file in, just its
 * client_email and private_key fields as separate env vars (see
 * .env.example). The private key's newlines get escaped as literal "\n"
 * when stored in a .env file, so they're unescaped back here.
 */
class Ga4Client
{
    private const DATE_RANGE = ['startDate' => '7daysAgo', 'endDate' => 'today'];

    public static function isConfigured(): bool
    {
        return filled(config('services.ga4.property_id'))
            && filled(config('services.ga4.client_email'))
            && filled(config('services.ga4.private_key'));
    }

    public static function fetchOverview(): array
    {
        $propertyId = config('services.ga4.property_id');
        $token = self::accessToken();

        $summary = self::runReport($token, $propertyId, [
            'dateRanges' => [self::DATE_RANGE],
            'metrics' => [
                ['name' => 'activeUsers'],
                ['name' => 'sessions'],
                ['name' => 'screenPageViews'],
                ['name' => 'averageSessionDuration'],
                ['name' => 'bounceRate'],
            ],
        ]);

        $deviceReport = self::runReport($token, $propertyId, [
            'dateRanges' => [self::DATE_RANGE],
            'dimensions' => [['name' => 'deviceCategory']],
            'metrics' => [['name' => 'activeUsers']],
        ]);

        $countryReport = self::runReport($token, $propertyId, [
            'dateRanges' => [self::DATE_RANGE],
            'dimensions' => [['name' => 'country']],
            'metrics' => [['name' => 'activeUsers']],
            'orderBys' => [['metric' => ['metricName' => 'activeUsers'], 'desc' => true]],
            'limit' => 5,
        ]);

        $values = data_get($summary, 'rows.0.metricValues', []);
        $get = fn (int $i) => (float) ($values[$i]['value'] ?? 0);

        $devices = [];
        foreach (data_get($deviceReport, 'rows', []) as $row) {
            $name = data_get($row, 'dimensionValues.0.value', 'unknown');
            $devices[$name] = (int) data_get($row, 'metricValues.0.value', 0);
        }

        $topCountries = collect(data_get($countryReport, 'rows', []))->map(fn ($row) => [
            'country' => data_get($row, 'dimensionValues.0.value', 'Unknown'),
            'activeUsers' => (int) data_get($row, 'metricValues.0.value', 0),
        ])->all();

        return [
            'activeUsers' => (int) $get(0),
            'sessions' => (int) $get(1),
            'pageViews' => (int) $get(2),
            'avgSessionDurationSeconds' => (int) round($get(3)),
            'bounceRate' => (int) round($get(4) * 100), // GA4 returns a 0–1 fraction
            'devices' => $devices,
            'topCountries' => $topCountries,
            'dateRange' => 'Last 7 days',
        ];
    }

    private static function runReport(string $token, string $propertyId, array $body): array
    {
        $response = Http::withToken($token)
            ->post("https://analyticsdata.googleapis.com/v1beta/properties/{$propertyId}:runReport", $body)
            ->throw();

        return $response->json();
    }

    /**
     * Exchanges the service account's credentials for a short-lived OAuth2
     * access token via a signed JWT assertion (RFC 7523), cached for just
     * under its 1-hour lifetime so we're not re-signing on every request.
     */
    private static function accessToken(): string
    {
        return Cache::remember('ga4_access_token', 3000, function () {
            $clientEmail = config('services.ga4.client_email');
            $privateKey = str_replace('\\n', "\n", config('services.ga4.private_key'));

            $now = time();
            $header = self::base64UrlEncode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
            $claims = self::base64UrlEncode(json_encode([
                'iss' => $clientEmail,
                'scope' => 'https://www.googleapis.com/auth/analytics.readonly',
                'aud' => 'https://oauth2.googleapis.com/token',
                'iat' => $now,
                'exp' => $now + 3600,
            ]));

            openssl_sign("{$header}.{$claims}", $signature, $privateKey, 'SHA256');
            $jwt = $header.'.'.$claims.'.'.self::base64UrlEncode($signature);

            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ])->throw();

            return $response->json('access_token');
        });
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
