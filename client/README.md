# @set-forge/client — Set Forge UI

Workout planning and strength tracking app (React, Vite, TanStack Router, FSD). This package lives under `client/` in the monorepo.

**Monorepo setup, versioning, and releases:** see the [root README](../README.md).

---

// TODO logo

![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0-443e38)
![TanStack Router](https://img.shields.io/badge/TanStack%20Router-1.160-FF4154)
![FSD](https://img.shields.io/badge/Architecture-FSD-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Description

A workout planning and strength tracking app that lets you build exercise lists, log sets and weights, rate perceived effort, and visualize progress over time.

## Prerequisites

From the **repository root**: Node `v22.20.0`, npm `v10.9.3` (see root README). Run `npm install` once at the root to install all workspaces and git hooks.

## Available scripts

Run these **from the repository root** (they delegate to this workspace):

| Command | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc && vite build` |
| `npm run preview` | Preview production build (`client/dist`) |
| `npm run check-deps` / `npm run upgrade-deps` | Dependency maintenance |
| `npm run format` / `npm run format:check` | Prettier |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run test:unit` / `npm run test:unit-cov` | Jest unit tests |
| `npm run test:snap` / `npm run test:snap-cov` / `npm run test:snap-update` | Snapshot tests |
| `npm run test:e2e` | Playwright |
| `npm test` | Unit + snap + e2e |
| `npm run storybook` / `npm run build-storybook` | Storybook |
| `npm run chromatic` | Chromatic |
| `npm run docs` | TypeDoc |
| `npm run e2e:install` | Playwright browsers |

## Features

- Create workout lists with multiple exercises
- Track progress in interactive workout mode
- Real-time progress bars with gradient fills
- Double tap to mark sets complete
- Data persistence in localStorage with 80% warning
- Dark theme by default (light theme ready)
- Mobile-first responsive design
- Touch-friendly UI (min 44px tap targets)

## Repository

- Repository: https://github.com/a1exevs/set-forge
- Project board: https://github.com/users/a1exevs/projects/9

## Useful links

- Nu Html Checker — https://validator.w3.org/nu/
