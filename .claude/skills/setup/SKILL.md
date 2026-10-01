---
name: setup
description: Set up a developer machine for this repository from scratch — Docker, nvm / Node / npm, gh CLI with GitHub access, env files, then prove the client and the server build and run. Use when a new developer joins, when the user asks to set up / bootstrap the environment, or runs /setup.
argument-hint: "[--full]"
---

# setup

Act as an onboarding engineer. Bring this machine to the state where `npm run client:dev`, `npm run server:start:dev`,
the tests and the GitHub workflows (`/commit`, `/pr`, `/release`) all work. macOS is the primary platform; Windows
and Linux get a short fallback in every step.

Optional argument `--full` (`$1`): also download Playwright browsers and run the e2e suites at the end.

## Rules

- **Diagnose first, install second.** Every step starts with a check; install only what is missing.
- **Confirm each system-level install** (Homebrew, Docker, nvm, gh, global npm) before running it, one step at a time.
  Project-level steps (`npm install`, builds, migrations) need no confirmation.
- **Interactive steps belong to the developer:** `gh auth login`, the first launch of Docker Desktop, SSH key
  passphrases. Print the exact command, wait for the developer to say it is done, then re-run the check.
- **Never read `.env*` files** (denied in `.claude/settings.json`) — env files are handled only through
  `scripts/setup-env.sh`, which prints key names, never values.
- **Never change the developer's git identity, remotes or shell profile silently** — propose the command, let them
  run it or approve it.
- Keep a running status table; end with the report in [Report](#report).

## 1. Platform and package manager

Detect the OS (`uname -s`; `MSYS`/`MINGW` on Windows Git Bash). On Windows every shell command below runs in
**Git Bash** (it ships with Git for Windows), not PowerShell.

| Platform | Package manager | Check | Install |
|---|---|---|---|
| macOS | Homebrew | `brew --version` | https://brew.sh (the developer runs the install script) |
| Windows | winget | `winget --version` | ships with Windows 11 / App Installer |
| Linux (Debian/Ubuntu) | apt | `apt --version` | preinstalled |

## 2. git and the GitHub CLI

Checks:

```bash
git --version
gh --version
gh auth status
git config user.name && git config user.email
git remote get-url origin
```

Install when missing: `brew install git gh` · Windows `winget install Git.Git GitHub.cli` · Linux
[gh install docs](https://github.com/cli/cli/blob/trunk/docs/install_linux.md).

Then, in order:

1. **Authentication** — if `gh auth status` fails, the developer runs
   `gh auth login -h github.com -p ssh -s user:email` and lets gh generate and upload an SSH key. **SSH is the
   recommended git protocol:** `origin` is already `git@github.com:a1exevs/set-forge.git`, pushes then go over the
   key and do not depend on the gh token or its scopes at all (no credential helper, no `workflow` scope needed
   for branches that touch `.github/workflows`), and gh's own API calls (`gh pr`, `gh release`) are covered by
   the default `repo`, `read:org`, `gist`. `user:email` is only for the identity check below. An existing login
   is extended with `gh auth refresh -h github.com -s user:email`; `gh auth status` lists the token's scopes and
   the protocol.
   HTTPS only if the developer insists (a network that blocks port 22): `gh auth login -p https -s
   workflow,user:email`, `gh auth setup-git` and `git remote set-url origin https://github.com/a1exevs/set-forge.git`
   (with approval) — over HTTPS the token pushes, so `workflow` becomes necessary for the `/release` flow.
2. **Repository access** — `gh repo view a1exevs/set-forge --json name,viewerPermission` must succeed;
   `ssh -T git@github.com` must greet the user when the remote is SSH.
3. **Identity** — `user.name` / `user.email` must be set (global is fine). Compare the email with
   `gh api user/emails --jq '.[] | select(.verified) | .email'`; a commit email that GitHub does not know is not
   linked to the profile. A 403 / 404 here means the token lacks the scope: the developer runs
   `gh auth refresh -h github.com -s user:email`. Propose `git config --global user.email <verified email>` when
   they differ.
4. **Labels** the `/pr` and `/release` skills attach must exist: `gh label list --repo a1exevs/set-forge` should
   include `feature`, `bugfix`, `common`, `improvement`, `storybook`, `tests`, `documentation`, `refactoring`,
   `testing`, `release`. Report missing ones; do not create them (the repo owner decides).

## 3. Docker

Needed for the local MySQL (`npm run db:up`), both e2e suites (Testcontainers) and the prod stack.

```bash
docker --version
docker compose version
docker info --format '{{.ServerVersion}}'   # fails when the daemon is not running
```

Install: `brew install --cask docker` (Docker Desktop) or `brew install orbstack` if the developer prefers it ·
Windows `winget install Docker.DockerDesktop` (WSL 2 backend) · Linux
[Docker Engine](https://docs.docker.com/engine/install/) + `sudo usermod -aG docker $USER` (re-login).
After the install the developer starts Docker Desktop once and accepts its terms; wait for `docker info` to pass.

Pre-pull the image both compose and Testcontainers use: `docker pull mysql:8.4`.

## 4. Node through nvm

The version is pinned in `.nvmrc` and in `engines` of the three `package.json` files (Node **22.23.2**,
npm **10.9.8**). npm only warns on a mismatch, so check explicitly.

`nvm` is a shell function, so it does not exist in the non-interactive shell the agent runs: look for its script
and source it before every `nvm` call. Homebrew keeps it under its own prefix, the install script under `~/.nvm`.

```bash
NVM_SH="$(brew --prefix nvm 2>/dev/null)/nvm.sh"; [ -s "$NVM_SH" ] || NVM_SH="${NVM_DIR:-$HOME/.nvm}/nvm.sh"
[ -s "$NVM_SH" ] && echo "nvm: $NVM_SH" || echo "nvm: not installed"
node --version    # v22.23.2
npm --version     # 10.9.8
```

- macOS / Linux: `brew install nvm` (follow the printed shell-profile snippet) or the
  [nvm install script](https://github.com/nvm-sh/nvm#installing-and-updating); then in the repo root
  `. "$NVM_SH" && nvm install && nvm use` (`nvm install` reads `.nvmrc`). Suggest `nvm alias default 22.23.2`
  so new shells match, and offer the shell hook that runs `nvm use` on `cd` into a folder with `.nvmrc`
  ([nvm README → Deeper Shell Integration](https://github.com/nvm-sh/nvm#deeper-shell-integration)) — the
  developer pastes it into `~/.zshrc` / `~/.bashrc` themselves. Every later `node` / `npm` command in this
  skill runs in a shell where `. "$NVM_SH" && nvm use` has been executed, otherwise the system Node is used.
- Windows: `winget install CoreyButler.NVMforWindows`, new terminal, `nvm install 22.23.2 && nvm use 22.23.2`
  (nvm-windows ignores `.nvmrc` — pass the version).
- npm: `npm install -g npm@10.9.8` when `npm --version` differs.

## 5. Dependencies and git hooks

From the repository root:

```bash
npm install
ls .husky/_/husky.sh    # prepare installed the hooks
```

`npm install` installs both workspaces and runs `prepare` (Husky). If it fails on a native module, re-check the
Node version first — that is the usual cause.

## 6. Env files

```bash
npm run setup:env          # = scripts/setup-env.sh
```

The script copies the missing `.env`, `server/.development.env` and `server/.e2e.env` from their `*.example`,
never overwrites, and compares the MySQL credentials of the compose stack with the API's. On a mismatch it exits 1:
run `npm run setup:env -- --fix` (copies the root values into `server/.development.env`) after the developer agrees.
`client/.env` is optional — the Vite defaults already proxy `/api` to `http://localhost:5001`, the API's dev port.

## 7. Verification

Run in this order and stop at the first failure (fix, then continue):

```bash
npm run client:build
npm run server:build
npm run db:up                  # mysql-dev on 127.0.0.1:3306
```

Before the migrations, wait until MySQL is healthy — the container needs ~20 s to initialize on the first run,
and `sequelize-cli` fails with a connection error before that. Match the status exactly: `unhealthy` contains
`healthy`. Give up after a minute and read `npm run db:logs`:

```bash
MYSQL_ID="$(docker compose --profile dev ps -q mysql-dev)"
for i in $(seq 1 30); do
  docker inspect --format '{{.State.Health.Status}}' "$MYSQL_ID" | grep -qx healthy && break
  [ "$i" -eq 30 ] && { echo "mysql-dev is not healthy after 60 s"; exit 1; }
  sleep 2
done
npm run server:db:migrate
npm run server:db:seed
```

Then start the API in the background, wait for the health endpoint (bounded — a crash on startup, usually wrong
`MYSQL_*` values, would otherwise wait forever), and stop it. Run the artifact that `server:build` just produced
as **one** Node process, not `npm run server:start:dev`: npm → cross-env → nest → node is a chain of processes,
and killing the npm PID may leave the watcher's Node alive on :5001. `ConfigModule` reads `.development.env`
from the working directory, so start it from `server/`:

```bash
cd server
NODE_ENV=development node dist/src/main > /tmp/set-forge-api.log 2>&1 &
API_PID=$!
cd ..
for i in $(seq 1 30); do
  curl -fsS http://localhost:5001/api/1.0/health && break
  [ "$i" -eq 30 ] && { echo "API did not answer in 60 s, see /tmp/set-forge-api.log"; kill "$API_PID"; exit 1; }
  sleep 2
done
kill "$API_PID"
```

Client: `npm run client:dev` must serve `http://localhost:5173` (open it or `curl -fsS` the URL). Optionally
`npm run client:lint` and `npm run server:lint` to confirm the toolchain.

With `--full`:

```bash
npm run client:e2e:install     # Playwright browsers
npm run server:test:e2e        # Jest + Testcontainers
npm run client:test:e2e        # Playwright full-stack
```

## Report

Finish with one table and nothing else beyond it:

| Area | Status | Left for the developer |
|---|---|---|
| Package manager | ✅ / ❌ | |
| git + gh (auth, repo access, identity, labels) | | e.g. `gh auth login` |
| Docker (daemon, mysql:8.4) | | |
| Node 22.23.2 / npm 10.9.8 via nvm | | |
| `npm install` + Husky hooks | | |
| Env files | | |
| Client build / dev server | | |
| Server build / migrations / health | | |
| e2e (only with `--full`) | | |

Everything with ❌ gets the exact command or link the developer needs.
