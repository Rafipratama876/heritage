# Google Analytics 4 (GA4) — setup from scratch

There are **two separate pieces** here, and both need to be done for GA4 to
actually be useful:

1. **Tracking** — a small script (`gtag.js`) added to every page that sends
   real visitor data to Google. Without this, your GA4 property just sits
   empty forever, no matter what else you configure.
2. **Reporting** — a read-only service account this app uses to pull GA4's
   stats back into `/admin/insight`, so you don't have to leave the admin
   panel to see them.

Part 1 alone gives you the full Google Analytics website (analytics.google.com)
with all its normal reports. Part 2 is optional — only do it if you want
a summary of the same numbers surfaced inside `/admin/insight` too.

---

## Part 1 — Create the GA4 property and get tracking working

### 1. Create a Google Analytics account + property

1. Go to [analytics.google.com](https://analytics.google.com) and sign in
   with any Google account (doesn't need to be tied to Hostinger/GitHub/etc
   — a personal or business Gmail is fine).
2. **Admin** (gear icon, bottom-left) → **Create Account** if you don't have
   one yet. Name it something like "Rizal Heritage".
3. Inside that account, **Create Property** → name it "Rizal Heritage
   Website" → set your timezone (Indonesia) and currency (IDR) → **Next**.
4. Fill in the small business-details questionnaire (industry category,
   business size — doesn't affect anything technical, just Google's own
   categorization) → **Create**. Accept the Terms of Service.

### 2. Create a Web data stream and get the Measurement ID

1. Still in **Admin**, under the property you just made → **Data Streams**
   → **Add stream** → **Web**.
2. **Website URL**: `https://rizalheritage.com`. **Stream name**: anything,
   e.g. "Rizal Heritage — main site".
3. Click **Create stream**. You'll land on the stream's details page —
   at the top right is your **Measurement ID**, formatted like `G-XXXXXXXXXX`.
   Copy it.

### 3. Add the Measurement ID to the app

The app already has the tracking snippet built in
(`resources/views/app.blade.php`) — it just needs the ID to activate. On
your **server** (`~/laravel-app/.env`):

```bash
nano ~/laravel-app/.env
```

Add (or fill in if the line's already there from the template):

```
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

Then:

```bash
cd ~/laravel-app
php artisan config:clear
```

That's it — no rebuild needed, this isn't part of the Vite frontend bundle
(it's rendered server-side in the base HTML template), so no `npm run
build`/upload step required for this specific change.

### 4. Verify it's actually sending data

1. Open `https://rizalheritage.com` in a normal browser tab (not the
   `/etc/hosts` trick from earlier — use the real domain now that DNS/SSL
   are live).
2. In GA4, go to **Reports → Realtime**. Within ~30 seconds you should see
   **1 active user** — that's you. Click around the site a bit and watch
   the events (`page_view`, etc.) show up in Realtime.
3. If nothing shows up: open your browser's DevTools → Network tab, reload
   the page, and search for a request to `google-analytics.com/g/collect`.
   If it's missing entirely, double check `GA4_MEASUREMENT_ID` is set and
   `config:clear` was run; if it's present but GA4 doesn't show it, an ad
   blocker/privacy extension in your test browser is likely eating it —
   try an incognito window with extensions disabled, or a phone on mobile
   data.

**That's the whole tracking setup.** Full reports (Acquisition, Engagement,
Demographics, etc.) take 24–48 hours to populate with meaningful data —
Realtime is immediate, the rest of GA4 batches overnight.

---

## Part 2 (optional) — Pull GA4 stats into `/admin/insight`

This app's own `/admin/insight` dashboard already works without this —
it's backed by this app's own visit/search tracking (a separate system,
stored in your MySQL database). This part just adds a GA4-sourced section
on top, showing the same kind of numbers (active users, sessions, top
countries, device breakdown) but computed by Google instead.

### 5. Enable the Analytics Data API in Google Cloud

1. Go to [console.cloud.google.com](https://console.cloud.google.com).
   You can use the same Google account as Part 1, or a different one — GA4
   property access is granted separately in step 7 regardless.
2. If you don't have a project yet: top bar → **Select a project** →
   **New Project** → name it "Rizal Heritage Analytics" → **Create**.
3. With that project selected, go to **APIs & Services → Library**, search
   **"Google Analytics Data API"**, open it, click **Enable**.

### 6. Create a service account and download its key

1. **APIs & Services → Credentials** → **+ Create Credentials** →
   **Service account**.
2. Name it something like `ga4-reporter` → **Create and Continue** → skip
   the optional role/access steps (not needed — access is granted directly
   in GA4 instead, next step) → **Done**.
3. Click into the service account you just created → **Keys** tab →
   **Add Key → Create new key** → **JSON** → **Create**. A `.json` file
   downloads to your computer — **keep it, don't lose it, don't commit it
   to Git.**
4. Note the service account's email from that same page — it looks like
   `ga4-reporter@your-project-id.iam.gserviceaccount.com`.

### 7. Grant that service account access to your GA4 property

1. Back in [analytics.google.com](https://analytics.google.com) → **Admin**
   → under the property → **Property Access Management**.
2. **+** (top right) → **Add users** → paste the service account's email
   from step 6.4 → role: **Viewer** (read-only — that's all this app
   needs) → **Add**.

### 8. Get the values `.env` needs

Open the downloaded JSON key file — you need exactly two fields out of it
(never paste the whole file anywhere):

```json
{
  "client_email": "ga4-reporter@your-project-id.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgk...\n-----END PRIVATE KEY-----\n"
}
```

You also need the **Property ID** (a plain number, *not* the Measurement
ID from Part 1): GA4 → **Admin** → under the property → **Property
details**, near the top — looks like `properties/123456789`, you only need
the number `123456789`.

### 9. Add these to `.env` on the server

```bash
nano ~/laravel-app/.env
```

```
GA4_PROPERTY_ID=123456789
GA4_CLIENT_EMAIL=ga4-reporter@your-project-id.iam.gserviceaccount.com
GA4_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgk...\n-----END PRIVATE KEY-----\n"
```

Important: **keep it as one line, wrapped in double quotes, with literal
`\n` characters** exactly as they appear in the JSON file (don't turn them
into real line breaks) — `Ga4Client.php` un-escapes them back into a real
multi-line key internally.

Then:

```bash
cd ~/laravel-app
php artisan config:clear
```

### 10. Verify

Log into `/admin` as an admin user, open **Insight**. The GA4 section
should now show real numbers instead of "not configured". It may show
zeros for the first day if Part 1 was only just switched on — GA4 needs a
little real traffic before there's anything to report.

---

## Summary — what each variable actually does

| `.env` variable | What it's for | Required for |
|---|---|---|
| `GA4_MEASUREMENT_ID` | Public tag, activates the `gtag.js` snippet on every page | Any GA4 tracking at all (Part 1) |
| `GA4_PROPERTY_ID` | Which GA4 property to read stats from | `/admin/insight`'s GA4 section (Part 2) |
| `GA4_CLIENT_EMAIL` | Service account identity | same |
| `GA4_PRIVATE_KEY` | Service account's signing key | same |

You can do Part 1 without Part 2 (tracking works, just no summary inside
the admin panel). Part 2 without Part 1 is pointless — there'd be nothing
for it to read.
