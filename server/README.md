# @set-forge/server — Set Forge API

NestJS HTTP API for Set Forge web-client: authentication, workout lists flow (Sequelize + MySQL). This package lives under `server/` in the monorepo.

**Monorepo setup, versioning, and releases:** see the [root README](../README.md).

---

<!-- TODO: logo -->

![NestJS](https://img.shields.io/badge/NestJS-9.1-e0234e?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-6.25-3993db)
![MySQL](https://img.shields.io/badge/MySQL-2.3-4479a1?logo=mysql&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-29.2-C21325?logo=jest&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## Description

This backend is designed for **workout planning and strength tracking** — exercise lists, logging sets and weights, perceived effort, and **progress over time**.

## Prerequisites

From the **repository root**: Node `v22.20.0`, npm `v10.9.3` (see root README). Run `npm install` once at the root to install all workspaces and git hooks.

Local development typically needs MySQL (see root **Docker** scripts: `db:up` / `db:down`) and env files such as `.development.env` expected by `ConfigModule`.

## Available scripts

Run these **from the repository root** (they delegate to this workspace):

| Command | Description |
|--------|-------------|
| `npm run server:start` | `nest start` (production mode env) |
| `npm run server:start:dev` | `nest start --watch` (development) |
| `npm run server:start:debug` | `nest start --debug --watch` |
| `npm run server:start:prod` | Run compiled `dist/src/main` |
| `npm run server:build` | `tsc` compile |
| `npm run server:format` / `npm run server:format:check` | Prettier |
| `npm run server:lint` / `npm run server:lint:fix` | ESLint |
| `npm run server:test:unit` / `npm run server:test:unit-watch` / `npm run server:test:unit-cov` / `npm run server:test:unit-debug` | Jest unit tests |
| `npm run server:test:e2e` | Jest e2e (`jest-e2e.json`) |
| `npm run server:check-deps` / `npm run server:upgrade-deps` | Dependency maintenance |

You can also run the same script names **from `server/`** after install (for example `npm run start:dev` inside this package).

## Environment used for verification

- Node: `v22.20.0`
- npm: `10.9.3`
