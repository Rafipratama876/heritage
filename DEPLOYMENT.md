# Deploying to shared hosting (no VPS)

This app is plain Laravel + Inertia/React. **Node is only needed to build the
frontend assets** (`npm run build`) — that build happens on your own machine
or in CI, never on the server. The server only ever needs to run PHP and
MySQL, which is exactly what ordinary shared hosting (cPanel-style) provides.
That's what makes this cheaper than the old Next.js + Express setup, which
needed a long-running Node process (hence a VPS).

## 1. What your hosting needs

Check these before buying/renting anything:

- **PHP 8.3+** with extensions: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`,
  `xml`, `ctype`, `json`, `bcmath`, `fileinfo`, `curl`. Almost every host's
  default PHP build already has these — cPanel's "Select PHP Version" tool
  lets you toggle any that are missing.
- **MySQL 5.7+ / MariaDB 10.3+** with a database + user (cPanel: "MySQL
  Databases").
- **Cron jobs** (cPanel: "Cron Jobs") — needed for the scheduled analytics
  cleanup (`insight:cleanup`, runs daily at 03:00). Almost all shared hosting
  includes this even on the cheapest plans.
- **SSH access is a "nice to have", not required.** Both paths below are
  covered. If your host's control panel has a "Terminal" app (common on
  cPanel even without full SSH), treat it the same as SSH.

## 2. Build locally, then decide what to upload

On your own machine, from `laravel-app/`:

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

`npm run build` writes static, hashed JS/CSS into `public/build/` — that's
the only thing the frontend build produces, and it's just files at that
point. `vendor/` from composer is PHP-only. Nothing here needs Node at
runtime.

**Do not upload:** `node_modules/`, `.env` (create it fresh on the server —
see §4), `tests/`, `.git/`.

**Do upload:** everything else, including `vendor/` and `public/build/`.

## 3. Document root: point it at `public/`, not the app root

Laravel's entry point is `public/index.php` — the web server's document root
must be that `public/` folder, never the app root (`laravel-app/` itself),
or your `.env`, `app/`, `vendor/`, etc. become directly downloadable.

- **If your host lets you set a custom document root for the
  domain/subdomain** (common with reseller/business cPanel plans, or
  "Addon Domains"): point it straight at `laravel-app/public`. Nothing
  further to do here — this is the clean path, use it if available.
- **If your host only gives you `public_html/` with no document-root
  option** (typical bare-bones shared hosting): upload the Laravel app
  *outside* `public_html` (e.g. as a sibling folder `laravel-app/`), then
  put the *contents* of `laravel-app/public/` inside `public_html/`, and
  edit the two path lines in `public_html/index.php` to point up to the
  real app location:

  ```php
  require __DIR__.'/../laravel-app/vendor/autoload.php';
  $app = require_once __DIR__.'/../laravel-app/bootstrap/app.php';
  ```

  (Adjust `../laravel-app` to wherever you actually placed it relative to
  `public_html`.) This keeps `app/`, `vendor/`, `.env`, etc. outside the
  publicly-served directory while still serving the built assets correctly.

## 4. Create `.env` on the server

Copy `.env.production.example` (in this repo) to `.env` on the server and
fill in the real values — database credentials from cPanel's MySQL tool,
your real domain for `APP_URL`, and so on. Generate the app key **locally**
first so a real secret never sits in a wide-open PHP process's environment
history:

```bash
php artisan key:generate --show
```

Paste that value into the server's `APP_KEY`.

**`APP_URL` must exactly match the real public URL.** File uploads
(`Storage::disk('public')->url(...)` in `app/Http/Controllers/Admin/
UploadController.php`) build their public links from this — get it wrong
and every uploaded product image/video 404s even though the file exists.

## 5. Get the database schema onto the server

- **With SSH/Terminal:**
  ```bash
  php artisan migrate --force
  php artisan db:seed --force   # optional, demo catalog data only — see note below
  ```
- **Without any shell access:** run `php artisan migrate --force` once
  locally against a database reachable from your machine (or a staging
  copy), then export the resulting schema with `mysqldump --no-data` and
  import that dump through cPanel's phpMyAdmin. Any migrations added later
  need the same treatment — export just the new tables/columns, or
  temporarily get Terminal access for that one command.

  > **Note on `db:seed`:** the demo catalog seeder uses `fakerphp/faker`,
  > which is a `require-dev` package — a production `composer install
  > --no-dev` (§2) won't have it installed, so `db:seed` will fatal-error
  > there. It's meant for local/staging only; for a real launch, skip it
  > and add your real products through the admin panel instead.

## 6. The `storage:link` symlink

Uploaded product images/videos live in `storage/app/public/` and are served
through a symlink at `public/storage/` pointing to it.

- **With SSH/Terminal:** `php artisan storage:link` — done.
- **Without shell access:** most hosts' File Manager can't create symlinks
  either. Workaround: skip the symlink, and instead make `public/storage/` a
  real folder, then re-upload its contents (or rsync/FTP-sync them) after
  every batch of admin uploads. This is the one part of this stack that's
  measurably worse without at least Terminal access — if your host offers a
  "Terminal" app in cPanel (many do, even on shared plans, distinct from
  full SSH), use it just for this one command instead of maintaining a
  manual copy step.

## 7. File permissions

`storage/` and `bootstrap/cache/` must be writable by the web server process
(commonly the `nobody` or your cPanel username's PHP-FPM user):

```bash
chmod -R 775 storage bootstrap/cache
```

If your host runs PHP as your own cPanel user (typical with PHP-FPM/suPHP),
plain `755` is usually enough since you already own the files — only bump to
`775`/`777` if uploads or cache writes still fail with a permissions error.

## 8. Cron: the Laravel scheduler

The daily analytics cleanup (`insight:cleanup`, see `routes/console.php`) and
any future scheduled task run through Laravel's scheduler, which itself
needs exactly **one** cron entry (cPanel → Cron Jobs → "Add New Cron Job"),
running every minute:

```
* * * * * cd /home/youruser/laravel-app && php artisan schedule:run >> /dev/null 2>&1
```

Adjust the path to wherever you placed the app. You do **not** need a
separate cron line per scheduled task — `schedule:run` itself checks what's
due each minute.

## 9. Post-deploy checklist

- [ ] Visit the homepage — storefront pages load, styling looks right (proves
      `public/build/` assets were uploaded and are being served)
- [ ] Register a test account, log in, log out
- [ ] Log in as an admin (promote a user's `role` to `admin` directly in
      phpMyAdmin if you don't have one yet), confirm `/admin` loads and a
      non-admin gets rejected
- [ ] Create a product with an uploaded image in the admin panel, confirm the
      image actually displays on the storefront (this is the `APP_URL` /
      `storage:link` check from §4 and §6)
- [ ] Add something to the cart, confirm the WhatsApp checkout link opens
      with the right message
- [ ] Confirm `php artisan schedule:list` (via Terminal, or trust §8's cron
      entry) shows `insight:cleanup` due
- [ ] Set `APP_DEBUG=false` (already in `.env.production.example`) — never
      leave debug mode on in production, it leaks stack traces and env values
      to anyone who hits an error page
