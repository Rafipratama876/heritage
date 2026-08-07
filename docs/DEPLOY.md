# Auto-deploy on push to `main`

`.github/workflows/deploy.yml` SSHes into the VPS on every push to `main`
and re-runs the Docker Compose stack at `/opt/rizal-heritage`. One-time
setup below — do this once, then every `git push` to `main` redeploys
automatically.

## 1. Generate a deploy-only SSH keypair

Run this **on your own machine**, not on the VPS:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ./rizal-heritage-deploy-key -N ""
```

This creates two files in the current directory:
- `rizal-heritage-deploy-key` — the **private** key. This goes into a GitHub
  secret and nowhere else. Don't commit it, don't paste it into chat/Slack.
- `rizal-heritage-deploy-key.pub` — the **public** key. This goes on the VPS.

## 2. Authorize the public key on the VPS

SSH into the VPS as usual, then as the `deploy` user append the public key:

```bash
ssh deploy@202.155.16.39
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "<paste contents of rizal-heritage-deploy-key.pub here>" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Confirm the `deploy` user can actually run Docker and has write/git access
to `/opt/rizal-heritage`:

```bash
cd /opt/rizal-heritage && git status && docker compose ps
```

If `docker compose` needs `sudo` for this user, either add `deploy` to the
`docker` group (`sudo usermod -aG docker deploy`, then re-login) or the
workflow's script will fail with a permission error.

## 3. Add the GitHub repo secrets

From the repo root, using the GitHub CLI (`gh`) — run this yourself, the
private key never needs to leave your machine or appear in chat:

```bash
gh secret set SSH_HOST --body "202.155.16.39"
gh secret set SSH_USER --body "deploy"
gh secret set SSH_PRIVATE_KEY < ./rizal-heritage-deploy-key
```

(`SSH_PORT` is optional — only set it if the VPS doesn't use port 22:
`gh secret set SSH_PORT --body "2222"`.)

No `gh` CLI? Use the GitHub web UI instead: repo → **Settings** → **Secrets
and variables** → **Actions** → **New repository secret**, and add the same
three name/value pairs (paste the raw contents of the private key file,
including the `-----BEGIN...-----` / `-----END...-----` lines, for
`SSH_PRIVATE_KEY`).

Once the secrets are set, delete the local key files or move them
somewhere safe outside the repo — they're not needed again unless you
rotate the key.

## 4. Test it

Push any commit to `main`, then check **Actions** tab on GitHub — the
"Deploy to production" run should go green in under a minute. You can also
trigger it manually without pushing: Actions → Deploy to production → Run
workflow.

## What the workflow actually does

```
git fetch origin main
git reset --hard origin/main   # discards any local edits on the server — see note below
docker compose build           # rebuilds images (frontend bakes NEXT_PUBLIC_API_URL etc. in at this step)
docker compose up -d           # recreates any container whose image changed
docker image prune -f          # drops old dangling images so disk doesn't fill up
```

Backend DB migrations run automatically on container start
(`backend/Dockerfile`'s `CMD` runs `prisma migrate deploy` before the
server boots), so no separate migration step is needed here.

**Note on `git reset --hard`:** this assumes `/opt/rizal-heritage` on the
VPS is only ever updated by this workflow (or manual `git pull`), never
hand-edited in place — any local changes made directly on the server will
be silently discarded on the next deploy. If you sometimes edit files
directly on the VPS, tell me and I'll change this to a plain `git pull`
that fails loudly on conflicts instead.
