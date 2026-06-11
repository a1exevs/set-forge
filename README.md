# Set Forge — monorepo

Workspaces:

| Package | Path | Description |
|--------|------|-------------|
| **@set-forge/client** | [`client/`](client/) | React / Vite web app |
| **@set-forge/server** | [`server/`](server/) | Reserved for future API / backend |

Shared release notes: [`RELEASE-NOTES.md`](RELEASE-NOTES.md) (repository root).

## Prerequisites

- Node **22.20.0**, npm **10.9.3**

## Install

From the **repository root**:

```bash
npm install
```

This installs npm workspaces (`client`, `server`), hoists dependencies, and runs **`prepare`** (Husky git hooks).

## Daily commands

All scripts are defined in the **root** [`package.json`](package.json) and forward to `@set-forge/client` where needed:

```bash
npm run dev
npm run build
npm run test
npm run lint
npm run storybook
```

Formatting:

- `npm run format` / `npm run format:check` — Prettier for the **client** workspace (see [`client/package.json`](client/package.json)).
- `npm run format:root` / `npm run format:root:check` — Prettier for root [`scripts/`](scripts/) TypeScript (same [`client/.prettierrc.cjs`](client/.prettierrc.cjs) as the client; **Project build** CI runs `format:root:check`).

Details and stack badges: [`client/README.md`](client/README.md).

## Version bumps (monorepo)

These scripts live **only in the root** `package.json`:

| Script | Effect |
|--------|--------|
| `npm run version:patch` / `version:minor` / `version:major` | Bumps the `version` field in **`client/package.json`** and **`server/package.json`** together (same semver). |
| `npm run update-version:patch` / `update-version:minor` / `update-version:major` | Runs the branch workflow in [`scripts/update-version.sh`](scripts/update-version.sh) (merge flow + `version:*` + commit). Requires a Unix shell (e.g. Git Bash on Windows). |

## Release steps

1. Run `npm run update-version:patch` (or `:minor`, `:major`) from the repo root when using the automated branch script.
2. Create a PR with message `[Common] Version increase vX.X.X` from `common/version-increase` into `develop`.
3. Create a PR with message `[Testing] Release vX.X.X` from `develop` into `testing`.
4. Open the [Vercel project](https://vercel.com/a1exevs-projects/set-forge/deployments), wait for the preview deployment, and verify behavior. **Vercel:** set **Root Directory** to `client` for this repository.
5. Create a PR with message `Release vX.X.X` from `testing` into `main`.
6. After production deploy on Vercel, verify the production site.
7. On GitHub: **Tags → Releases → Draft a new release** — create tag, use `develop` / `main` as documented in your release process, publish.
8. Merge `main` back into `testing` and push; merge `testing` into `develop` and push.
9. Update [`RELEASE-NOTES.md`](RELEASE-NOTES.md) using generated notes, then open a PR from `common/release-notes-update-vX.X.X` to `develop` with message `[Common] RELEASE-NOTES.md update vX.X.X`.

## Repository

- https://github.com/a1exevs/set-forge
