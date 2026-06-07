# @set-forge/client — Set Forge Web Client

Workout planning and strength tracking web app (React, Vite, TanStack Router, FSD). This package lives under `client/` in the monorepo.

**Monorepo setup, versioning, and releases:** see the [root README](../README.md).

---

<!-- TODO: logo -->

![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0-443e38)
![TanStack Router](https://img.shields.io/badge/TanStack%20Router-1.160-FF4154)
![FSD](https://img.shields.io/badge/Architecture-FSD-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Description

A workout planning and strength tracking web-app that lets you build exercise lists, log sets and weights, rate perceived effort, and visualize progress over time.

## Prerequisites

From the **repository root**: Node `v22.20.0`, npm `v10.9.3` (see root README). Run `npm install` once at the root to install all workspaces and git hooks.

## Available scripts

From the **repository root**, use the `client:*` aliases (see [root README](../README.md#client-set-forgeclient)). From **`client/`**, use the names below.

| Command | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc && vite build` |
| `npm run preview` | Preview production build (`client/dist`) |
| `npm run format` / `npm run format:check` | Prettier |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run test:unit` / `npm run test:unit-cov` | Jest unit tests |
| `npm run test:snap` / `npm run test:snap-cov` / `npm run test:snap-update` | Snapshot tests |
| `npm run test:e2e` | Playwright e2e (headless in CI; headed locally via config) |
| `npm run test:e2e:headed` | Playwright with a visible browser, one worker |
| `npm run test:e2e:ui` | Playwright UI mode (pick and watch tests) |
| `npm run test:e2e:debug` | Playwright debug (step through with inspector) |
| `npm test` | Unit + snap + e2e |
| `npm run storybook` / `npm run build-storybook` | Storybook |
| `npm run chromatic` | Chromatic |
| `npm run docs` | TypeDoc |
| `npm run e2e:install` | Download Playwright browsers (required once after `npm install` or Playwright upgrade) |
| `npm run check-deps` / `npm run upgrade-deps` | Dependency maintenance |

### E2E (Playwright)

Browser binaries are **not** installed by `npm install`. Before the first e2e run (or after `@playwright/test` is upgraded):

```bash
npm run e2e:install          # from client/
# or from repo root:
npm run client:e2e:install
```

`test:e2e` starts (or reuses) the Vite dev server on port **5173**; the Nest API is **not** required for current smoke tests. To watch tests in a real browser window, use `test:e2e:headed` or `test:e2e:ui`.

## API base and dev proxy

The client always calls the API through the same-origin `/api/1.0` base path. In the production compose stack, `client-prod` nginx reverse-proxies `/api/` to `server-prod`, while Caddy provides HTTPS in front of nginx.

For local development, Vite proxies `/api` to a backend target:

- Default: `http://localhost:5001`
- Override: copy [`.env.example`](.env.example) to `.env.local` and set `VITE_DEV_API_PROXY`, for example `https://staging.example.com`

The app intentionally keeps one same-origin API base for both prod and dev.

## Environment used for verification

- Node: `v22.20.0`
- npm: `10.9.3`
