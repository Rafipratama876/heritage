# Deploying to Hostinger

Step-by-step guide for this specific project on Hostinger's shared/business web
hosting (hPanel). This is the Hostinger-specific companion to
[DEPLOYMENT.md](DEPLOYMENT.md) — read that first for the *why* behind each
step; this file is the *exact clicks* for Hostinger's panel.

Reminder of the core idea: Node is **only** used on your own machine to build
the frontend (`npm run build`). Hostinger's server only ever runs PHP +
MySQL — nothing Node-related gets uploaded or installed there.

## 0. Before you start — check your plan

- **PHP 8.3+**: Hostinger's shared plans support this — you just need to
  select it (step 3 below).
- **MySQL**: included on every plan.
- **SSH access**: available on Premium/Business/Cloud hosting plans under
  **hPanel → Advanced → SSH Access**. If your plan doesn't show this option,
  skip to the "No SSH" branch in each step below — everything is still
  possible, just a bit more manual.
- **Cron Jobs**: available on every plan under **hPanel → Advanced → Cron
  Jobs** (no SSH needed for this one).

## 1. Build locally

On your own machine, from the project root:

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

This produces `vendor/` (PHP dependencies) and `public/build/` (the compiled
CSS/JS). Both need to be uploaded — nothing else Node-related does.

Do **not** upload: `node_modules/`, `.git/`, `tests/`, your local `.env`.

## 2. Create the database

1. **hPanel → Websites → [your site] → Databases → MySQL Databases**.
2. Under "Create a New MySQL Database and Database User", fill in a database
   name and a password (at least 8 characters, one uppercase, one lowercase,
   one number). Hostinger prefixes both the database name and username with
   your account id automatically (e.g. `u123456789_rizal`) — you can't
   remove that prefix, so just note the full generated names down.
3. Click **Create**. The new database appears in the list below — that's
   where you'll find the exact database name/username again later, and
   where the **phpMyAdmin** link lives if you need to inspect data directly.
4. The database host for shared hosting is almost always `localhost` — use
   that unless Hostinger's panel shows a different host next to your new
   database.

## 3. Set the PHP version

**hPanel → Websites → [your site] → Advanced → PHP Configuration** (exact
label may read "PHP Version" depending on your panel version). Select
**PHP 8.3** or newer. While you're there, confirm these extensions are
enabled (they usually are by default): `pdo_mysql`, `mbstring`, `openssl`,
`tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`, `curl`.

## 4. Upload the project

### If you have SSH (recommended — faster and lets you run Artisan directly)

1. **hPanel → Advanced → SSH Access** → note the host, port, and username
   (or enable SSH if it's currently off).
2. From your machine, zip everything you built in step 1 except
   `node_modules/`:
   ```bash
   zip -r deploy.zip . -x "node_modules/*" -x ".git/*" -x "tests/*"
   ```
3. Upload it (`scp deploy.zip user@yourhost:~/` or via **File Manager**'s
   upload button), then over SSH:
   ```bash
   cd ~/domains/yourdomain.com   # or wherever hPanel put your site
   unzip deploy.zip
   ```

### If you don't have SSH

1. Zip the project the same way as above.
2. **hPanel → Files → File Manager**, navigate into your domain's folder,
   upload the zip, then use File Manager's **Extract** action on it (avoids
   uploading thousands of small files one by one over FTP, which is slow and
   more failure-prone).

## 5. Point the domain at `public/`

Laravel's entry point is `public/index.php`. Getting the domain to serve
*from* that folder (not the project root) is the one step that's easy to get
wrong, so do it carefully.

- **If hPanel lets you set a custom document root for the
  domain/subdomain** (Business/Cloud plans, or when adding the site as an
  "Addon"/parked domain under **Websites → Manage → Domain**): point it at
  `public/` inside the folder you uploaded to. Nothing further needed —
  this is the clean path, use it if it's available to you.
- **If your plan only gives you a fixed `public_html/`** (typical on
  entry-level shared plans): upload the project *outside* `public_html`
  (e.g. as a sibling folder, `~/rizal-app/`), then copy the *contents* of
  `~/rizal-app/public/` into `public_html/`, and edit the two path lines in
  `public_html/index.php`:
  ```php
  require __DIR__.'/../rizal-app/vendor/autoload.php';
  $app = require_once __DIR__.'/../rizal-app/bootstrap/app.php';
  ```
  (Adjust `../rizal-app` to match wherever you actually placed it relative
  to `public_html`.) This keeps `app/`, `vendor/`, `.env`, etc. outside the
  publicly-served folder while `public_html` still serves the built assets.

## 6. Create `.env` on the server

Copy [.env.production.example](.env.production.example) to `.env` in the
project's root folder (not inside `public_html`) and fill in:

- `APP_URL` — your real domain, e.g. `https://rizalheritage.com`. This
  **must** match exactly — uploaded product images build their public URLs
  from this value, and a mismatch means every image 404s even though the
  file exists.
- `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` — the full prefixed names
  from step 2. `DB_HOST=localhost`.
- Generate `APP_KEY` **locally**, not on the server:
  ```bash
  php artisan key:generate --show
  ```
  Paste the output into `.env`'s `APP_KEY=`.
- `APP_ENV=production`, `APP_DEBUG=false` — never leave debug mode on in
  production, it leaks stack traces and env values to anyone who hits an
  error page.

## 7. Run migrations

**With SSH:**
```bash
cd ~/rizal-app   # wherever your project root ended up
php artisan migrate --force
```

**Without SSH:** run `php artisan migrate --force` once locally against a
database reachable from your machine (or a temporary staging copy), export
the resulting schema with `mysqldump --no-data`, and import that dump
through Hostinger's **phpMyAdmin** (linked from the MySQL Databases page in
step 2). Any migrations you add later need the same treatment.

> **Don't run `php artisan db:seed`** on the real production database — that
> seeder generates fake demo products via `fakerphp/faker`, which is a
> `require-dev` package your `composer install --no-dev` didn't even
> install. Add your real catalog through the admin panel instead.

## 8. Link the storage folder

Uploaded product images/videos live in `storage/app/public/` and need to be
reachable at `public/storage/`.

**With SSH:**
```bash
php artisan storage:link
```

**Without SSH:** File Manager generally can't create a symlink either. The
workaround: skip the symlink, make `public_html/storage` (or `public/storage`
per your setup in step 5) a real folder instead, and re-upload its contents
after each batch of admin uploads. If your plan has a **Terminal** app in
hPanel distinct from full SSH, that's usually enough to run just this one
command — worth checking before resigning yourself to the manual copy step.

## 9. File permissions

If Hostinger runs PHP as your own account (the norm on shared hosting), the
uploaded files already have the right owner and `storage/`/`bootstrap/cache/`
just need to be writable:

```bash
chmod -R 775 storage bootstrap/cache
```

Only needed with SSH; without it, most File Manager "Permissions" dialogs let
you set this per-folder if uploads or the cache start throwing permission
errors.

## 10. Set up the cron job (for scheduled tasks like `insight:cleanup`)

**hPanel → Advanced → Cron Jobs** (this one doesn't need SSH, it's built into
the panel):

1. Click to add a new cron job.
2. Command:
   ```
   cd /home/youruser/rizal-app && php artisan schedule:run >> /dev/null 2>&1
   ```
   Adjust the path to your actual project root. Use the full path to `php`
   (e.g. `/usr/bin/php8.3`) if the panel's form doesn't already resolve `php`
   on its own — check with `which php` over SSH, or ask Hostinger support if
   you don't have SSH.
3. Interval: **every minute** (Laravel's scheduler itself decides what's
   actually due each minute — you only need this one entry, not a separate
   cron line per scheduled task).

## 11. Post-deploy checklist

- [ ] Visit the homepage — storefront loads, styling looks right (confirms
      `public/build/` assets uploaded and are being served)
- [ ] Register a test account, log in, log out
- [ ] Promote a user's `role` to `admin` via phpMyAdmin if you don't have one
      yet, confirm `/admin` loads and a non-admin gets rejected
- [ ] Create a product with an uploaded image in the admin panel, confirm the
      image actually displays on the storefront (the `APP_URL` / storage-link
      check from steps 6 and 8)
- [ ] Add something to the cart, confirm the WhatsApp checkout link opens
      with the right message
- [ ] Double check `APP_DEBUG=false` in the live `.env`

If something doesn't load, check **hPanel → Advanced → Error Log** (or
`storage/logs/laravel.log` if you have file access) before anything else —
Laravel's own error page is disabled in production by `APP_DEBUG=false`, so
the log file is where the actual error message goes.

---

Sources consulted for Hostinger-specific panel steps: [Hostinger — How to
create a new MySQL Database](https://www.hostinger.com/support/1583542-how-to-create-a-new-mysql-database-in-hostinger/),
[Hostinger — Cron Jobs](https://www.hostinger.com/support/hpanel/cron-jobs/),
[Hostinger — Cron job tutorial](https://www.hostinger.com/tutorials/how-to-run-and-configure-cron-jobs-on-hpanel/).
Hostinger's panel does change its exact wording over time — if a menu label
above doesn't match what you see, look for the nearest equivalent (e.g.
"PHP Version" vs "PHP Configuration") rather than assuming the feature moved.
