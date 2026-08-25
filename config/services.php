<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'ga4' => [
        'property_id' => env('GA4_PROPERTY_ID'),
        'client_email' => env('GA4_CLIENT_EMAIL'),
        'private_key' => env('GA4_PRIVATE_KEY'),
        // Public "G-XXXXXXX" tag — separate from the service-account creds
        // above. Those are read-only (server-side, powers /admin/insight's
        // GA4 section); this one is what actually sends real visitor data
        // to Google in the first place, via the gtag.js snippet in
        // resources/views/app.blade.php. Without this, the property stays
        // empty no matter how correct the service-account creds are.
        'measurement_id' => env('GA4_MEASUREMENT_ID'),
    ],

];
