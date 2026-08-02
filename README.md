# Set Forge

<p align="center">
  <img src="client/public/logo-og.png" alt="Set Forge" width="712" />
</p>

## Description

Build workout lists, log sets and weights, rate perceived effort, and track strength progress over time.

Workspaces:

| Package | Path | Description          |
|--------|------|----------------------|
| **@set-forge/client** | [`client/`](client/) | React / Vite web app |
| **@set-forge/server** | [`server/`](server/) | Nest API / backend   |

Shared release notes: [`RELEASE-NOTES.md`](RELEASE-NOTES.md) (repository root).

## Prerequisites

- Node **22.23.2**, npm **10.9.8**

## Install

From the **repository root**:

```bash
npm install
```

This installs npm workspaces (`client`, `server`), hoists dependencies, and runs **`prepare`** (Husky git hooks).

To run client e2e tests locally, also download Playwright browsers once: `npm run client:e2e:install`.

Server e2e tests need **Docker** locally (Testcontainers starts ephemeral MySQL).

## CI (GitHub Actions)

| Workflow | Runs on | What it checks |
|----------|---------|----------------|
| [Project test](.github/workflows/project-test.yml) | `ubuntu-latest` | Client unit + snap, server unit |
| [E2E Tests](.github/workflows/e2e-tests.yml) | `windows-latest` + `ubuntu-latest` | Client Playwright e2e; server Jest e2e (Docker + Testcontainers) |
| [Project build](.github/workflows/project-build.yml) | `ubuntu-latest` | Format, lint, client/server build, Storybook build |
| [Chromatic](.github/workflows/chromatic.yml) | — | Visual regression (Storybook) |

## Available scripts

Run from the **repository root**. Names mirror `package.json` workspaces and shared tooling.

### Client (`@set-forge/client`)

| Command | Description |
|--------|-------------|
| `npm run client:dev` | Vite dev server |
| `npm run client:build` | Production build (`tsc && vite build`) |
| `npm run client:preview` | Preview production build (`client/dist`) |
| `npm run client:format` / `npm run client:format:check` | Prettier |
| `npm run client:lint` / `npm run client:lint:fix` | ESLint |
| `npm run client:test:unit` / `npm run client:test:unit-cov` | Jest unit tests |
| `npm run client:test:snap` / `npm run client:test:snap-cov` / `npm run client:test:snap-update` | Snapshot tests |
| `npm run client:test:e2e` | Playwright e2e (headless in CI; headed locally via config) |
| `npm run client:test:e2e:headed` | Playwright with a visible browser, one worker |
| `npm run client:test:e2e:ui` | Playwright UI mode (pick and watch tests) |
| `npm run client:test:e2e:debug` | Playwright debug (step through with inspector) |
| `npm run client:test` | Full client test script (unit + snap + e2e) |
| `npm run client:storybook` / `npm run client:build-storybook` | Storybook |
| `npm run client:chromatic` | Chromatic |
| `npm run client:docs` | TypeDoc |
| `npm run client:generate:icons` | Regenerate favicon/OG PNG/ICO from client `public/*.svg` (sources: `logo.svg`, `favicon.svg` — see [client README](client/README.md#generateicons)) |
| `npm run client:e2e:install` | Download Playwright browsers (once after install or Playwright upgrade) |
| `npm run client:check-deps` / `npm run client:upgrade-deps` | Dependency maintenance |

### Server (`@set-forge/server`)

| Command | Description |
|--------|-------------|
| `npm run server:start` | Nest `start` (production env) |
| `npm run server:start:dev` | Nest `start --watch` (development) |
| `npm run server:start:debug` | Nest debug + watch |
| `npm run server:start:prod` | Run `dist/src/main` |
| `npm run server:build` | TypeScript compile |
| `npm run server:format` / `npm run server:format:check` | Prettier |
| `npm run server:lint` / `npm run server:lint:fix` | ESLint |
| `npm run server:test:unit` / `npm run server:test:unit-watch` / `npm run server:test:unit-cov` / `npm run server:test:unit-debug` | Jest unit tests |
| `npm run server:test:e2e` | Jest e2e |
| `npm run server:db:migrate` / `:undo` / `:undo:all` / `:status` | Sequelize migrations against the local DB |
| `npm run server:db:seed` / `:undo` | Sequelize seeders against the local DB |
| `npm run server:check-deps` / `npm run server:upgrade-deps` | Dependency maintenance |

### Docker & database

| Command | Description |
|--------|-------------|
| `npm run db:up` | `docker compose --profile dev up -d mysql-dev` |
| `npm run db:down` | `docker compose --profile dev down` |
| `npm run db:logs` | MySQL logs (`-f`) |
| `npm run prod:up` | Production compose up (`--build -d`): Caddy + client (nginx) + server + MySQL |
| `npm run prod:down` | Production compose down |
| `npm run prod:logs` | Caddy + server + client + MySQL logs (`-f`) |
| `npm run prod:db:migrate` / `:undo` / `:status` | Run Sequelize migrations inside the running prod `server-prod` container |
| `npm run prod:db:seed` / `:undo` | Run Sequelize seeders inside the running prod `server-prod` container |

#### Production topology (`--profile prod`)

A single `npm run prod:up` builds and starts four containers:

- `mysql` — no host port (API reaches it as `mysql:3306` on the compose network only).
- **Dev:** `mysql-dev` (profile `dev`) maps `127.0.0.1:${MYSQL_PUBLIC_PORT:-3306}` for tools on the host (`npm run db:up`).
- `server-prod` — Nest API, **internal-only** (no host port; reachable inside the compose network as `server-prod:5000`).
- `client-prod` — nginx (image built from [`client/Dockerfile`](client/Dockerfile)) serving the built SPA on internal port 80. nginx also reverse-proxies `/api/` to `server-prod:5000` (see [`client/nginx.conf`](client/nginx.conf)).
- `caddy` — public TLS reverse proxy in front of `client-prod`; binds `${HTTP_PORT:-80}` and `${HTTPS_PORT:-443}` on the host and serves the whole app on one HTTPS origin.

Persistent Docker volumes:

- `mysql_data_dev` and `mysql_data_prod` keep dev/prod database files separate.
- `caddy_data` and `caddy_config` persist Caddy certificates and config state.
- `server_static` stores uploaded static files from `SERVER_STATIC=static`.
- `server_logs` stores application error logs from `SERVER_LOGS=logs`.

`server-prod` keeps a read-only root filesystem and can write only to `/tmp`, `/app/dist/static`, and `/app/dist/logs`.

#### Production environment files

Create these files before running `npm run prod:up`:

- Root `.env` (copy from [`.env.example`](.env.example)): compose-level values such as MySQL bootstrap credentials, `SITE_ADDRESS`, `VITE_PUBLIC_ORIGIN` (OG meta for the client Docker build), the legal/privacy build args `VITE_PRIVACY_OPERATOR_NAME_RU` / `VITE_PRIVACY_OPERATOR_NAME_EN` (per-language data-controller name shown in the Privacy Policy / Terms; `VITE_PRIVACY_OPERATOR_NAME` is an optional shared fallback) and `VITE_PRIVACY_CONTACT_EMAIL`, and optional host port overrides.
- `client/.env` (copy from [`client/.env.example`](client/.env.example), **local dev only**): Vite dev overrides such as `VITE_DEV_API_PROXY`, `VITE_PUBLIC_ORIGIN`, and `VITE_PRIVACY_OPERATOR_NAME_RU` / `VITE_PRIVACY_OPERATOR_NAME_EN` / `VITE_PRIVACY_CONTACT_EMAIL` for manual `vite build`.
- `server/.production.env` (copy from [`server/.production.env.example`](server/.production.env.example)): Nest runtime values such as `SERVER_URL`, `CLIENT_URL`, MySQL connection credentials, JWT/session secrets, `SERVER_STATIC`, `SERVER_LOGS`, and the legal-document versions `TERMS_VERSION` / `PRIVACY_VERSION` (bump to trigger re-consent).

For local HTTPS checks on Windows, ports 80/443 are often occupied by `HTTP.sys`. Use this in the root `.env` and open `https://localhost:8443/`:

```env
SITE_ADDRESS=localhost
HTTP_PORT=8080
HTTPS_PORT=8443
```

When you use a non-default HTTPS port locally, include that port in `server/.production.env` too:

```env
SERVER_URL=https://localhost:8443
CLIENT_URL=https://localhost:8443
```

For a VDS, do not override `HTTP_PORT` / `HTTPS_PORT`; Caddy should bind real ports 80 and 443 so it can issue certificates and serve the app normally. Without a purchased domain you can use an `sslip.io` hostname:

```env
SITE_ADDRESS=185-10-20-30.sslip.io
VITE_PUBLIC_ORIGIN=https://185-10-20-30.sslip.io
```

Then set the matching public origin in `server/.production.env`:

```env
SERVER_URL=https://185-10-20-30.sslip.io
CLIENT_URL=https://185-10-20-30.sslip.io
```

The browser and API use the same origin. The frontend calls `/api/1.0/...`, nginx forwards `/api/` to `server-prod`, and Caddy handles HTTPS.

#### Database initialization

`synchronize` is `false` in every environment, so the API never creates tables on its own. After `npm run prod:up` finishes and `server-prod` is healthy, run migrations + the initial seeder once:

```bash
npm run prod:db:migrate         # creates roles, users, users_roles, refreshTokens, user_*
npm run prod:db:seed            # inserts default `user` / `admin` roles (idempotent)
```

For local development against `mysql-dev`, the equivalent flow is `npm run db:up` → `npm run server:db:migrate` → `npm run server:db:seed`. See [`server/README.md`](server/README.md#database-schema-sequelize-migrations) for full details and how to add new migrations.

### Root tooling

| Command | Description |
|--------|-------------|
| `npm run prepare` | Husky install (runs automatically after `npm install` unless `HUSKY=0`) |
| `npm run format:root` / `npm run format:root:check` | Prettier for `scripts/**/*.{ts,tsx}` |
| `npm run version:patch` / `npm run version:minor` / `npm run version:major` | Bump version via `scripts/increase-version.ts` |
| `npm run update-version:patch` / `npm run update-version:minor` / `npm run update-version:major` | Version branch workflow (`scripts/update-version.sh`) |

## Release steps
1. run npm update-version:patch (or :minor, :major)
2. create PR with message "[Common] Version increase vX.X.X" from "common/version-increase" into "develop"
3. create PR with message "[Testing] Release vX.X.X" from "develop" into "testing"
4. create PR with message "Release vX.X.X" from "testing" into "main"
5. go to Github Repo Home page -> Tags -> Releases -> Draft a new release.
- create a new tag via "Choose a tag" autocomplete
- select "develop" branch as a target
- click the "Generate release notes" button, remove unnecessary notes if necessary, check PR messages and correct the messages if necessary (via PR editing)
- select "main" branch as a target
- click the "Publish release"
6. update RELEASE-NOTES.md with using generated notes in step 5, create PR from "common/release-notes-update-vX.X.X" to "develop" with message "[Common] RELEASE-NOTES.md update vX.X.X"

**Full-stack production on [VDS Selectel](https://vds.selectel.ru/):** step-by-step deploy guide — [`DEPLOY-SELECTEL.md`](DEPLOY-SELECTEL.md) (Docker Compose + Caddy + MySQL on Ubuntu).
// TODO add details after release

## Environment used for verification

- Node: `v22.23.2`
- npm: `10.9.8`
- Docker: `28.0.4`
- Docker Compose: `v2.34.0-desktop.1`

## Features

- Create workout lists with multiple exercises
- Track progress in interactive workout mode
- Real-time progress bars with gradient fills
- Double tap to mark sets complete
- Data persistence via backend API (MySQL) with authenticated sessions
- Bilingual (RU/EN) Privacy Policy and Terms of Use with explicit consent at registration (152-ФЗ)
- Versioned legal-document acceptance with a blocking re-consent gate after updates
- Self-service account deletion with full cascade removal of user data
- Dark theme by default (light theme ready)
- Mobile-first responsive design
- Touch-friendly UI (min 44px tap targets)

## Repository

- Repository: https://github.com/a1exevs/set-forge
- Project board: https://github.com/users/a1exevs/projects/9

## Useful links

- Nu Html Checker — https://validator.w3.org/nu/
