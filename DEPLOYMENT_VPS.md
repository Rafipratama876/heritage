# Deploying to a VPS (Rumahweb, Ubuntu)

This is the VPS version of `DEPLOYMENT.md`. Same app, same build (`npm run
build` only ever needs to happen once per deploy — Node never needs to stay
running), but on a VPS you have root access and set up the whole stack
yourself instead of relying on cPanel. That also means: no more "no SSH"
workarounds — every step below assumes full shell access.

Steps 1–4 are one-time server setup. Step 5 onward is the actual deploy, and
§10 is what you repeat on every future update.

---

## 0. Before you start

- **Point your domain at the VPS.** In Rumahweb's client area (or wherever
  your domain's DNS is managed), add an **A record** for your domain (and
  `www` if you want both) pointing at the VPS's public IP. DNS can take a
  few minutes to a few hours to propagate — do this first so it's ready by
  the time you need SSL in §8.
- **Get your VPS's root SSH details** from the Rumahweb order confirmation
  email or client panel: IP address, root password (or SSH key if you set
  one during provisioning).
- You'll pick a domain to use below — replace `yourdomain.com` everywhere
  with the real one.

## 1. First login and basic hardening

```bash
ssh root@YOUR_VPS_IP
```

Update the system and create a non-root user to work as (never run the app,
or day-to-day commands, as root):

```bash
apt update && apt upgrade -y
adduser deploy
usermod -aG sudo deploy
```

Copy your SSH key over so you can log in as `deploy` without a password
(optional but recommended), then switch to it for everything from here on:

```bash
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
su - deploy
```

Basic firewall — only allow SSH, HTTP, and HTTPS in:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 2. Install the stack

**PHP 8.3+** with the extensions Laravel needs. Ubuntu's default repos are
often behind, so add the `ondrej/php` PPA first:

```bash
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.3 php8.3-fpm php8.3-mysql php8.3-mbstring \
  php8.3-xml php8.3-curl php8.3-bcmath php8.3-zip php8.3-gd php8.3-cli
```

**Composer:**

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

**MySQL:**

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

**Nginx:**

```bash
sudo apt install -y nginx
```

**Node.js** (only needed if you build the frontend *on the VPS* — see §5's
note; skip this if you'll build locally and upload `public/build/` instead):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

**Git** (for pulling the repo):

```bash
sudo apt install -y git
```

## 3. Create the database

```bash
sudo mysql
```

```sql
CREATE DATABASE rizal_heritage CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'rizal_heritage'@'localhost' IDENTIFIED BY 'CHOOSE_A_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON rizal_heritage.* TO 'rizal_heritage'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Keep that password — it goes into `.env` in §6.

## 4. Get the code onto the server

This repo's GitHub remote is `git@github.com:Rafipratama876/heritage.git`.
Two ways to pull it onto the VPS:

- **HTTPS + a GitHub Personal Access Token** (simplest if the repo is
  private — GitHub removed plain password auth):
  ```bash
  sudo mkdir -p /var/www/rizal-heritage
  sudo chown deploy:deploy /var/www/rizal-heritage
  git clone https://github.com/Rafipratama876/heritage.git /var/www/rizal-heritage
  # when prompted: username = your GitHub username, password = a token from
  # https://github.com/settings/tokens (classic token, "repo" scope)
  ```
- **SSH deploy key** (no password prompt on future pulls — nicer for §10):
  generate a key on the VPS (`ssh-keygen -t ed25519 -C "vps-deploy"`), add
  the printed public key to the repo's **Settings → Deploy keys** on GitHub
  (read-only is enough), then `git clone git@github.com:Rafipratama876/heritage.git /var/www/rizal-heritage`.

From here on, `/var/www/rizal-heritage` is "the app" — adjust the path in
every command below if you put it somewhere else.

## 5. Install dependencies and build

```bash
cd /var/www/rizal-heritage
composer install --no-dev --optimize-autoloader
```

For the frontend build, either:

- **Build on the VPS** (needs Node installed per §2):
  ```bash
  npm ci
  npm run build
  ```
- **Build locally and upload just `public/build/`** (keeps Node off the
  server entirely, matching the "no long-running Node process" point of
  this whole migration): on your own machine, `npm run build`, then
  `rsync -avz public/build/ deploy@YOUR_VPS_IP:/var/www/rizal-heritage/public/build/`.

Either way, the result is the same: static hashed JS/CSS files sitting in
`public/build/`. Node is never running as a service — it's only ever a
build-time step.

## 6. Configure `.env`

```bash
cp .env.production.example .env
nano .env
```

Fill in:
- `APP_URL=https://yourdomain.com` — **must exactly match the real
  domain+scheme.** `Storage::disk('public')->url()` builds every uploaded
  image/video's public link from this — get it wrong and uploads 404 even
  though the file exists.
- `DB_DATABASE=rizal_heritage`, `DB_USERNAME=rizal_heritage`,
  `DB_PASSWORD=` (the password from §3)
- `VITE_WHATSAPP_NUMBER` — your real WhatsApp order number
- Leave `SESSION_DRIVER`/`CACHE_STORE`/`QUEUE_CONNECTION` as `database` —
  this app doesn't dispatch any background jobs, so no Redis/queue worker
  is needed regardless.

Generate the app key and finish setup:

```bash
php artisan key:generate
php artisan migrate --force
php artisan storage:link
```

(`db:seed` is optional demo data — same caveat as shared hosting: the
`fakerphp/faker` package used by the seeder is dev-only, so skip it in a
`--no-dev` install and add real products through the admin panel instead.)

## 7. File permissions and Nginx

Give the web server user (`www-data` on Ubuntu) ownership, and make sure the
two directories Laravel writes to are writable:

```bash
sudo chown -R deploy:www-data /var/www/rizal-heritage
sudo find /var/www/rizal-heritage -type f -exec chmod 664 {} \;
sudo find /var/www/rizal-heritage -type d -exec chmod 775 {} \;
sudo chmod -R 775 /var/www/rizal-heritage/storage /var/www/rizal-heritage/bootstrap/cache
```

Nginx server block — create `/etc/nginx/sites-available/rizal-heritage`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/rizal-heritage/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    client_max_body_size 100M; # matches the video-upload limit in UploadController
}
```

Enable it and reload:

```bash
sudo ln -s /etc/nginx/sites-available/rizal-heritage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 8. SSL (Let's Encrypt, free)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot edits the Nginx config to redirect HTTP → HTTPS and auto-renews via
a systemd timer it installs — nothing further to do. After this, go back to
`.env` and confirm `APP_URL` uses `https://` and `SESSION_SECURE_COOKIE=true`
(already set in the template), then:

```bash
php artisan config:clear
```

## 9. Cron: the Laravel scheduler

Same one entry as shared hosting — `insight:cleanup` runs daily via
`routes/console.php`, and the scheduler needs exactly one cron line that
fires every minute:

```bash
crontab -e   # as the `deploy` user
```

```
* * * * * cd /var/www/rizal-heritage && php artisan schedule:run >> /dev/null 2>&1
```

No Supervisor/queue-worker setup needed — this app doesn't dispatch any
queued jobs (`QUEUE_CONNECTION=database` is just Laravel's default; nothing
in the codebase calls `dispatch()`).

## 10. Deploying updates later

Once this is all set up, shipping a code change is just:

```bash
cd /var/www/rizal-heritage
git pull origin main
composer install --no-dev --optimize-autoloader
npm ci && npm run build      # or rsync a locally-built public/build/, per §5
php artisan migrate --force  # only if new migrations were added
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo systemctl reload php8.3-fpm
```

Consider turning this into a small `deploy.sh` script once you're doing it
a few times — it's the same handful of commands every time.

## 11. Post-deploy checklist

- [ ] Visit `https://yourdomain.com` — storefront loads, styling looks
      right, padlock shows valid SSL
- [ ] Register a test account, log in, log out
- [ ] Promote a user's `role` to `admin` directly in MySQL if you don't
      have one yet (`UPDATE users SET role='admin' WHERE email='...';`),
      confirm `/admin` loads and a non-admin gets rejected
- [ ] Create a product with an uploaded image in the admin panel, confirm
      the image actually displays on the storefront (this is the
      `APP_URL` / `storage:link` check from §6)
- [ ] Add something to the cart, confirm the WhatsApp checkout link opens
      with the right message
- [ ] `php artisan schedule:list` shows `insight:cleanup` due, and
      `crontab -l` shows the cron entry from §9
- [ ] `APP_DEBUG=false` in `.env` (already set by the template) — never
      leave debug mode on in production
- [ ] `sudo ufw status` shows only SSH/HTTP/HTTPS open
