# Deploying to Hostinger shared hosting (hPanel, with SSH)

Based on your hPanel screenshot: domain `rizalheritage.com`, server IP
`145.223.108.254`, username `u806236373`, doc-root folder `public_html`,
SSH already enabled. This is Hostinger's **shared hosting** (not a VPS) —
you don't get root/sudo or apt, but SSH is enough to run Composer, `artisan`,
and Git, which is really all this app needs on the server. Node never needs
to run on the server at all — `npm run build` only happens on your own
machine, then you upload the result.

## 0. Domain / nameserver status

Your screenshot shows the domain is mid-way through pointing to Hostinger's
nameservers (`hermes.dns-parking.com` / `artemis.dns-parking.com`, "selesai
dalam 24 jam"). You can do everything below **before** that finishes —
just use the server IP or a temporary preview URL to test until DNS has
propagated. Check propagation anytime with:

```bash
dig rizalheritage.com +short
```

Once it returns `145.223.108.254`, the domain is live.

## 1. Get your SSH connection details

hPanel → **Tingkat lanjut → SSH Access**. It shows the exact command,
something like:

```bash
ssh u806236373@145.223.108.254 -p 65002
```

(Hostinger uses a non-standard SSH port, not 22 — copy the exact port shown
in your panel, it may differ from this example.) Password is either the
hPanel account password or one shown on that same SSH Access page — check
there. Log in and confirm where you land:

```bash
pwd
ls
```

**Confirmed for this account:** the real `public_html` lives at
`/home/u806236373/domains/rizalheritage.com/public_html`, not directly in
the home directory — `~` only holds a `domains/` folder plus config
dotfiles. `~/laravel-app` (created in §5) sits in the home directory
alongside `domains/`. Every path below already reflects this.

## 2. Set the right PHP version

hPanel → **Tingkat lanjut → PHP Configuration** → select **PHP 8.3** (or
newer) for `rizalheritage.com`. This app's `composer.json` requires
`^8.3` — Hostinger sometimes defaults new accounts to an older version.

## 3. Check what's available over SSH

```bash
php -v          # should now show 8.3+
composer -V     # Hostinger ships Composer on most plans
git --version   # usually present; if not, skip to the zip-upload alternative in §5
```

## 4. Create the database

hPanel → **Database → Databases** (or **MySQL Databases**) → create a new
database and a new user, add that user to the database with **all
privileges**. Note down all three values — you'll need them for `.env`:
database name, username, password (host is `localhost`).

## 5. Get the code onto the server

> **Important — branch, not `main`.** GitHub's default branch on this repo
> is `main`, but `main` is still the *old Next.js/Express codebase* — the
> Laravel app lives entirely on the `refactor_into_laravel` branch, which
> hasn't been merged in. Always specify `-b refactor_into_laravel`
> explicitly (clone below, and every `git pull` in §11) or you'll end up
> with the wrong app on the server.

**With `git` available** (simplest — matches the earlier VPS-style
approach, just without root):

```bash
cd ~
git clone -b refactor_into_laravel https://github.com/Rafipratama876/heritage.git laravel-app
# if the repo is private: username = your GitHub username,
# password = a Personal Access Token from https://github.com/settings/tokens
```

**Without `git`, or if you'd rather not put a GitHub token on shared
hosting:** build and zip locally, then upload:

```bash
# on your own machine, from the repo root
composer install --no-dev --optimize-autoloader
npm ci && npm run build
zip -r laravel-app.zip . -x "node_modules/*" ".git/*" "tests/*"
```

Upload `laravel-app.zip` via hPanel's **File** → **File Manager** (or SFTP
using the same host/port/user as §1) into the home directory, then over SSH:

```bash
cd ~
unzip laravel-app.zip -d laravel-app
rm laravel-app.zip
```

If you went the git route instead, still run the build step on the server
(or locally + `rsync`/upload just `public/build/` — either is fine):

```bash
cd ~/laravel-app
composer install --no-dev --optimize-autoloader
```

## 6. Point `public_html` at the app's `public/` folder

This is the one Hostinger-specific step. The account's real web root is
always `public_html` — you can't retarget it to an arbitrary folder on
shared hosting — so make `public_html` *be* `laravel-app/public` via a
symlink, keeping `app/`, `.env`, `vendor/`, etc. safely outside the
publicly-served directory:

```bash
mv ~/domains/rizalheritage.com/public_html ~/domains/rizalheritage.com/public_html_old
ln -s ~/laravel-app/public ~/domains/rizalheritage.com/public_html
```

Verify it points the right way:

```bash
ls -la ~/domains/rizalheritage.com/
```

— should show `public_html -> /home/u806236373/laravel-app/public`.
(Delete `public_html_old` once you've confirmed the site works, or keep it
around briefly as a safety net.)

## 7. Configure `.env`

```bash
cd ~/laravel-app
cp .env.production.example .env
nano .env      # or edit via File Manager if you prefer a GUI
```

Fill in:
- `APP_URL=https://rizalheritage.com` — must exactly match the real domain.
  `Storage::disk('public')->url()` builds every uploaded product
  image/video's link from this — get it wrong and uploads 404 even though
  the file exists on disk.
- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` from §4 (`DB_HOST=localhost`)
- `VITE_WHATSAPP_NUMBER` — your real WhatsApp order number

Then:

```bash
php artisan key:generate
php artisan migrate --force
php artisan storage:link
```

(`db:seed` is optional demo data only — skip it in production; the seeder's
`fakerphp/faker` dependency isn't installed by `composer install --no-dev`
anyway. Add real products through `/admin` instead.)

## 8. Permissions

Shared-hosting file ownership is usually already correct (everything's
owned by your account, PHP-FPM runs as you), so this is rarely needed — only
run it if you hit a "permission denied" writing to storage/cache:

```bash
chmod -R 775 storage bootstrap/cache
```

## 9. SSL (free, via hPanel)

Once DNS has propagated (§0), hPanel → **Keamanan → SSL** → issue a free
Let's Encrypt certificate for `rizalheritage.com`. Hostinger auto-renews it.
After it's active, double check `.env` still has `APP_URL=https://...` and:

```bash
php artisan config:clear
```

## 10. Cron: the Laravel scheduler

hPanel → **Tingkat lanjut → Cron Jobs** → add a new job, run **every
minute**, command:

```bash
cd /home/u806236373/laravel-app && php artisan schedule:run >> /dev/null 2>&1
```

This single line covers the daily `insight:cleanup` job (and anything
scheduled later) — Laravel's scheduler checks internally what's actually
due each minute.

## 11. Deploying updates later

```bash
cd ~/laravel-app
git pull origin refactor_into_laravel       # if using the git route — NOT main, see note in §5
composer install --no-dev --optimize-autoloader
npm ci && npm run build                      # or upload a locally-built public/build/
php artisan migrate --force                  # only if new migrations were added
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

No service to restart on shared hosting (no `systemctl` access) — PHP-FPM
picks up code changes on the next request automatically.

## 12. Post-deploy checklist

- [ ] `dig rizalheritage.com +short` returns `145.223.108.254` (DNS done)
- [ ] `https://rizalheritage.com` loads with a valid SSL padlock
- [ ] Register a test account, log in, log out
- [ ] Promote a user to admin directly in the DB (hPanel → Database →
      phpMyAdmin: `UPDATE users SET role='admin' WHERE email='...';`),
      confirm `/admin` loads and a non-admin gets rejected
- [ ] Create a product with an uploaded image in the admin panel, confirm
      it actually displays on the storefront (the `APP_URL` / symlink
      check from §6 and §7)
- [ ] Add something to the cart, confirm the WhatsApp checkout link opens
      correctly
- [ ] `php artisan schedule:list` (over SSH) shows `insight:cleanup` due,
      and the cron job from §10 is saved in hPanel
- [ ] `.env` has `APP_DEBUG=false` (already set by the template)
