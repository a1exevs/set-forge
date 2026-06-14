# Deploying Set Forge on VDS Selectel

Step-by-step guide: from creating a server in the [VDS Selectel](https://vds.selectel.ru/) panel to a running app with HTTPS.

> **Important:** this guide is for **[vds.selectel.ru](https://vds.selectel.ru/)** (“cloud servers for developers”), not the unified Selectel panel at [my.selectel.ru](https://my.selectel.ru/) with “Cloud servers” / “VDS servers”.

**Stack on the server:** Docker Compose (`mysql` + Nest API + nginx + Caddy). Build and runtime run in containers; on the host you only need **`npm run prod:*`** scripts from [`package.json`](package.json) (requires Node.js and npm).

**Minimum VDS requirements:**

| Resource | Recommendation |
|----------|----------------|
| OS | Ubuntu 22.04 LTS or 24.04 LTS |
| CPU | 2 vCPU |
| RAM | 4 GB |
| Disk | 20 GB SSD |
| Network | Public IPv4 |

---

## Contents

1. [Create a server in VDS Selectel](#1-create-a-server-in-vds-selectel)
2. [First SSH connection](#2-first-ssh-connection)
3. [Basic server setup](#3-basic-server-setup)
4. [Open ports (firewall)](#4-open-ports-firewall)
5. [Install Docker and Docker Compose](#5-install-docker-and-docker-compose)
6. [Install Node.js and npm](#6-install-nodejs-and-npm)
7. [Get the project onto the server](#7-get-the-project-onto-the-server)
8. [Configure environment variables](#8-configure-environment-variables)
9. [Start the production stack](#9-start-the-production-stack)
10. [Initialize the database](#10-initialize-the-database)
11. [Verify it works](#11-verify-it-works)
12. [Update the application](#12-update-the-application)
13. [Useful commands](#13-useful-commands)
14. [Common issues](#14-common-issues)

---

## 1. Create a server in VDS Selectel

### 1.1. Registration and balance

1. Sign up or log in at **[vds.selectel.ru](https://vds.selectel.ru/)**.
2. Top up your account balance (bank card; see [payment methods](https://vds.selectel.ru/ru/payment.html) on the service site).
3. Make sure you have enough funds for the chosen plan: billing is **hourly** up to 672 hours per month ([pricing](https://vds.selectel.ru/ru/pricing.html)).

### 1.2. Create the server

1. In the VDS Selectel panel, click **Create server** (button on the [home page](https://vds.selectel.ru/) or in the dashboard after login).
2. **Configuration** — for the Set Forge production stack, choose a plan **from 1600 ₽/month** (4 GB RAM or more). The minimum 200 ₽/month plan (512 MB RAM) is not enough for Docker + MySQL + API.
3. **Operating system** — **Ubuntu 22.04 LTS** (or 24.04 LTS). Pick a plain Ubuntu image without presets like WordPress.  
   Optional: in the pre-installed software list you can choose **Docker** — then you can skip [step 5](#5-install-docker-and-docker-compose).
4. Set a **name** for the server (optional).
5. Confirm creation and wait until the server is running.

More on your first server — [VDS Selectel FAQ](https://vds.selectel.ru/ru/help/help-faq-start.html).

### 1.3. IP address and password

After the server is created in the VDS Selectel panel:

- **Public IPv4** — static, shown in the server list (e.g. `185.10.20.30`). The address stays with the server until it is deleted; reinstalling the OS does not change the IP.
- **`root` password** — on the server page in the panel. **Save it immediately** in a secure place.

> **A domain is optional.** You can use a free hostname like `185-10-20-30.sslip.io` (IP with dashes instead of dots). Caddy will automatically obtain a Let's Encrypt certificate for that name.

---

## 2. First SSH connection

VDS Selectel uses **`root`** by default. Get the IP from the [vds.selectel.ru](https://vds.selectel.ru/) panel.

**Linux / macOS** — from your local machine:

```bash
ssh root@185.10.20.30
```

When prompted, enter the `root` password from the VDS Selectel panel.

**Windows** — install [PuTTY](https://www.putty.org/) or use built-in OpenSSH on Windows 10+ with the same command `ssh root@<IP>`.

If you lost the password — you can **reinstall the OS** in the panel (a new password will be generated) or add an SSH key as recommended in the [VDS Selectel FAQ](https://vds.selectel.ru/ru/help/help-faq-start.html).

> After the first login, it is recommended to [add an SSH key](https://vds.selectel.ru/ru/help/help-faq-start.html) and connect without a password afterward.

---

## 3. Basic server setup

Run on the server as `root` (or via `sudo`):

```bash
apt update && apt upgrade -y
timedatectl set-timezone Europe/Moscow
apt install -y git curl ca-certificates ufw
```

Optional — a separate deploy user (if you already have an SSH key set up):

```bash
adduser deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/   # only if root already has a key
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
su - deploy
```

If you only log in with a password and have not added a key yet — you can run all steps below as **`root`**.

---

## 4. Open ports (firewall)

The app needs ports **22** (SSH), **80** (HTTP, Let's Encrypt validation), and **443** (HTTPS):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

> On **VDS Selectel** ([vds.selectel.ru](https://vds.selectel.ru/)), ports 22/80/443 are reachable from the internet by default — there are no separate “Security Groups” in the panel. Configuring `ufw` on the server is enough.

---

## 5. Install Docker and Docker Compose

Official method for Ubuntu:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

Verify:

```bash
docker run --rm hello-world
```

---

## 6. Install Node.js and npm

Scripts like `npm run prod:up`, `npm run prod:db:migrate`, and others are Docker Compose wrappers in [`package.json`](package.json). This guide uses **those scripts**, not raw `docker compose` commands — **except** in [§13 Log and disk usage](#log-and-disk-usage), where host-level log inspection and cleanup require direct `docker` / `docker compose` commands.

> **`npm install` in the repo root on the VDS is not required.** Images `server-prod` and `client-prod` are built inside Docker with exact Node **22.20.0** / npm **10.9.3** versions (see Dockerfiles). On the host, the **npm** CLI is enough to invoke the scripts.

Install Node.js 22 (includes npm) via the [NodeSource](https://github.com/nodesource/distributions) repository:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # expect v22.x
npm --version    # expect 10.x
```

---

## 7. Get the project onto the server

### Option A — clone from GitHub (recommended)

```bash
cd ~
git clone https://github.com/a1exevs/set-forge.git
cd set-forge
```

For a private repo, set up an SSH key on the server or use a deploy token.

### Option B — specific version (release tag)

```bash
cd ~/set-forge
git fetch --tags
git checkout v1.0.0   # replace with the tag you need
```

---

## 8. Configure environment variables

You need **two** files for production (plus optional `client/.env` for local Vite dev only). Copy the templates and edit the values.

### 8.1. Root `.env`

```bash
cd ~/set-forge
cp .env.example .env
nano .env
```

Example for a VDS **without your own domain** (IP `185.10.20.30`):

```env
MYSQL_ROOT_PASSWORD=strong_root_password
MYSQL_DATABASE=set_forge
MYSQL_USER=set_forge_user
MYSQL_PASSWORD=strong_db_password

SITE_ADDRESS=185-10-20-30.sslip.io
VITE_PUBLIC_ORIGIN=https://185-10-20-30.sslip.io
```

Example **with your own domain** (domain A record points to the server IP):

```env
MYSQL_ROOT_PASSWORD=strong_root_password
MYSQL_DATABASE=set_forge
MYSQL_USER=set_forge_user
MYSQL_PASSWORD=strong_db_password

SITE_ADDRESS=set-forge.example.com
VITE_PUBLIC_ORIGIN=https://set-forge.example.com
```

> **Do not override** `HTTP_PORT` and `HTTPS_PORT` on the VDS — Caddy must listen on standard ports 80 and 443 for automatic TLS.

### 8.2. `server/.production.env`

```bash
cp server/.production.env.example server/.production.env
nano server/.production.env
```

`SERVER_URL` and `CLIENT_URL` **must match** the public HTTPS address from `SITE_ADDRESS`:

```env
SERVER_URL=https://185-10-20-30.sslip.io
CLIENT_URL=https://185-10-20-30.sslip.io
PORT=5000

MYSQL_HOST=mysql
MYSQL_USER=set_forge_user
MYSQL_DB=set_forge
MYSQL_PASSWORD=strong_db_password
MYSQL_PORT=3306

SERVER_STATIC=static
SERVER_LOGS=logs
JWT_SECRET_KEY=long_random_string_1
SESSION_SECRET_KEY=long_random_string_2
```

Generate secrets:

```bash
openssl rand -hex 32
```

`MYSQL_USER`, `MYSQL_PASSWORD`, and `MYSQL_DB` must match the root `.env`.

---

## 9. Start the production stack

From the repository root:

```bash
cd ~/set-forge
npm run prod:up
```

This builds images and starts four containers:

| Container | Role |
|-----------|------|
| `mysql` | Database (no public port) |
| `server-prod` | Nest API (internal network) |
| `client-prod` | nginx: SPA + `/api/` proxy |
| `caddy` | HTTPS on ports 80/443 |

The first run may take several minutes (image build). Watch the logs:

```bash
npm run prod:logs
```

Wait until `server-prod` is **healthy** (healthcheck on `/api/1.0/health`).

Check status:

```bash
docker compose --profile prod ps
```

---

## 10. Initialize the database

Tables are **not created automatically** — you need migrations and initial data (roles `user` / `admin`):

```bash
npm run prod:db:migrate
npm run prod:db:seed
```

Verify:

```bash
npm run prod:db:migrate:status
```

Run `prod:db:seed` **once** on first deploy (or when new seeders are added in a release).

---

## 11. Verify it works

1. Open in a browser:
   - `https://185-10-20-30.sslip.io` or
   - `https://set-forge.example.com`
2. Confirm the certificate is valid (padlock in the address bar).
3. Register a user or sign in — the API is on the same origin via `/api/1.0/...`.

Health check from the server:

```bash
curl -sS https://185-10-20-30.sslip.io/api/1.0/health
```

Expect HTTP 200.

---

## 12. Update the application

After a new release (GitHub tag):

```bash
cd ~/set-forge
git fetch --tags
git checkout vX.X.X          # new version
npm run prod:down
npm run prod:up
npm run prod:db:migrate      # if the release includes new migrations
```

If needed — new seeders (rare):

```bash
npm run prod:db:seed
```

---

## 13. Useful commands

| Command | Description |
|---------|-------------|
| `npm run prod:up` | Build and start the stack |
| `npm run prod:down` | Stop and remove containers |
| `npm run prod:logs` | Logs for Caddy, API, client, MySQL |
| `npm run prod:db:migrate` | Migrations in the prod container |
| `npm run prod:db:seed` | Initial data (roles) |
| `docker compose --profile prod ps` | Container status |

Data is stored in Docker volumes: `mysql_data_prod`, `caddy_data`, `server_static`, `server_logs`.

### Log and disk usage

This section uses raw `docker` and `docker compose` commands (no npm wrappers): log paths and disk usage are host-level operations.

Container logs and API error files are stored on **disk**, not in RAM. The prod stack configures Docker log rotation in [`docker-compose.yml`](docker-compose.yml) (`max-size: 10m`, `max-file: 3` per container — about 30 MB cap each). On a long-running VDS, still check disk usage periodically; manual cleanup below helps if logs grew before rotation was enabled.

**Docker container logs** (stdout/stderr of each prod container):

```bash
cd ~/set-forge
docker compose --profile prod ps -q | while read id; do
  name=$(docker inspect --format '{{.Name}}' "$id" | sed 's#^/##')
  size=$(sudo du -b "$(docker inspect --format '{{.LogPath}}' "$id")" 2>/dev/null | cut -f1)
  printf '%s\t%s\n' "$(numfmt --to=iec-i --suffix=B "$size" 2>/dev/null || echo "${size}B")" "$name"
done | sort -h
```

Requires `numfmt` (GNU coreutils; present on Ubuntu/Debian). Without it, sizes are shown in bytes.

Total size of all Docker container logs on the host:

```bash
sudo du -ch /var/lib/docker/containers/*/*-json.log 2>/dev/null | tail -1
```

Per-file breakdown:

```bash
sudo du -h /var/lib/docker/containers/*/*-json.log 2>/dev/null | sort -h
```

**Server error logs** (only `error` level; files under `SERVER_LOGS=logs` in the `server-prod` container):

```bash
cd ~/set-forge
docker compose --profile prod exec server-prod du -sh /app/dist/logs
```

By year/month:

```bash
docker compose --profile prod exec server-prod sh -c 'du -h /app/dist/logs/*/* 2>/dev/null | sort -h'
```

Via the Docker volume on the host (volume name is `set-forge_server_logs` when the project directory is `set-forge`):

```bash
mp=$(docker volume inspect set-forge_server_logs --format '{{.Mountpoint}}' 2>/dev/null)
[ -n "$mp" ] || { echo "volume not found: set-forge_server_logs" >&2; exit 1; }
echo "$mp"
sudo du -sh "$mp"
sudo find "$mp" -type f -exec du -h {} \; | sort -h
```

**Quick summary** (Docker logs + error logs + free disk space):

```bash
echo "=== Docker container logs ==="
sudo du -ch /var/lib/docker/containers/*/*-json.log 2>/dev/null | tail -1

echo "=== Server error logs ==="
cd ~/set-forge && docker compose --profile prod exec server-prod du -sh /app/dist/logs

echo "=== Disk free ==="
df -h /
```

### Clear logs

> **Warning:** `truncate` and `rm` are irreversible. Clearing Docker logs does not stop containers. `npm run prod:down` removes containers (and their log files) but **keeps** data volumes (MySQL, uploads, error logs).

**Docker container logs** — clear prod stack only (containers keep running):

```bash
cd ~/set-forge
docker compose --profile prod ps -q | while read id; do
  log=$(docker inspect --format '{{.LogPath}}' "$id")
  name=$(docker inspect --format '{{.Name}}' "$id" | sed 's#^/##')
  [ -n "$log" ] || { echo "skip (no log path): $name" >&2; continue; }
  sudo truncate -s 0 "$log"
  echo "cleared: $name"
done
```

Clear **all** Docker container logs on the host:

```bash
sudo truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

To recreate containers (also drops their log files; volumes unchanged), see **Automatic Docker log rotation** below.

**Server error logs** — delete all files:

```bash
cd ~/set-forge
docker compose --profile prod exec server-prod sh -c 'rm -rf /app/dist/logs/*'
```

Delete error log files older than 30 days:

```bash
docker compose --profile prod exec server-prod find /app/dist/logs -type f -mtime +30 -delete
```

Via the Docker volume on the host:

```bash
mp=$(docker volume inspect set-forge_server_logs --format '{{.Mountpoint}}' 2>/dev/null)
[ -n "$mp" ] || { echo "volume not found: set-forge_server_logs" >&2; exit 1; }
sudo rm -rf "$mp"/*
```

**Verify after cleanup:**

```bash
echo "=== Docker logs ==="
sudo du -ch /var/lib/docker/containers/*/*-json.log 2>/dev/null | tail -1

echo "=== Error logs ==="
docker compose --profile prod exec server-prod du -sh /app/dist/logs

echo "=== Disk ==="
df -h /
```

**Automatic Docker log rotation** (already set in [`docker-compose.yml`](docker-compose.yml) for prod services):

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

After pulling a release that includes this change, recreate containers so the new logging options apply (also drops existing log files; data volumes unchanged):

```bash
cd ~/set-forge
npm run prod:down
npm run prod:up
```

---

## 14. Common issues

### Caddy does not issue a certificate

- Ports **80** and **443** must be open (`ufw allow` + confirm the VDS Selectel server is powered on in the panel).
- `SITE_ADDRESS` must resolve to your server IP (automatic for `sslip.io`).
- `.env` must not set non-default `HTTP_PORT` / `HTTPS_PORT`.

### `server-prod` does not become healthy

```bash
docker compose --profile prod logs server-prod
```

Common causes: wrong `MYSQL_*` in `server/.production.env`, or MySQL is not ready yet — wait and restart:

```bash
npm run prod:down && npm run prod:up
```

### CORS errors / wrong redirects

Check that `SERVER_URL` and `CLIENT_URL` in `server/.production.env` **exactly** match the URL in the browser (with `https://`, no trailing slash).

### Wrong or missing link preview (OG image)

`VITE_PUBLIC_ORIGIN` in the root `.env` must match `CLIENT_URL` (see [§8.3](#83-vite_public_origin-og-meta-tags)). Rebuild `client-prod` after changing it. Crawlers need absolute URLs — placeholders like `%VITE_PUBLIC_ORIGIN%` in the served HTML mean the image was built without the variable set.

### Not enough memory during build

Increase VDS RAM or add swap:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Production stack diagram

```
Internet
   │
   ▼
[Caddy :443/:80]  ← TLS, SITE_ADDRESS
   │
   ▼
[client-prod nginx :80]  ← SPA + /api/ → server-prod
   │
   ├──► [server-prod :5000]  ← Nest API
   │         │
   │         ▼
   └──    [mysql :3306]  ← Docker network only
```

---

## Related documentation

### Project

- [README.md](README.md) — monorepo overview and scripts
- [server/README.md](server/README.md) — API, migrations, environment variables
- [RELEASE-NOTES.md](RELEASE-NOTES.md) — release notes

### VDS Selectel

- [vds.selectel.ru](https://vds.selectel.ru/) — panel and server creation
- [Pricing](https://vds.selectel.ru/ru/pricing.html)
- [FAQ: getting started](https://vds.selectel.ru/ru/help/help-faq-start.html)
- Support: ticket in the panel or [vds@selectel.ru](mailto:vds@selectel.ru)
