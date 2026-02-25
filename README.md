# Set Forge - Workout Tracker

// TODO logo

![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0-443e38)
![TanStack Router](https://img.shields.io/badge/TanStack%20Router-1.160-FF4154)
![FSD](https://img.shields.io/badge/Architecture-FSD-blue)
![License](https://img.shields.io/badge/License-MIT-green)

# Description
A workout planning and strength tracking app that lets you build exercise lists, log sets and weights, rate perceived effort, and visualize progress over time.

## NPM version
v10.9.3

## Node version
v20.9.0. Use NVM:
1. nvm current - check current version of Node
2. nvm list - show list of available Node versions
3. nvm install <version> - to install and use Node version.
4. nvm use <version> - set version of Node as current version

## Available Scripts
In the project directory, you can run:

### `npm run dev`
Starts the application in development mode using `vite`.

### `npm run build`
Creates an optimized production build using `tsc && vite build`.

### `npm run preview`
Serves the static files from the `dist` directory.

### `npm run generate:routes`
Generates the TanStack Router route tree file (`src/route-tree.gen.ts`) from the routes directory. Required before lint in CI since the generated file is not committed.

### `npm run check-deps`
### `npm run upgrade-deps`
Checks/updates available dependencies to the latest version.

### `npm run format`
Formats code using Prettier for TypeScript, TSX, and CSS, SCSS files.

### `npm run format:check`
Checks code format using Prettier for TypeScript, TSX, and CSS, SCSS files.

### `npm run lint`
Runs ESLint for static code analysis on TypeScript and TSX files.

### `npm run lint:fix`
Fixes errors found by ESLint in TypeScript and TSX files.

### `npm test:unit`
Runs unit tests using the Jest configuration.

### `npm test:unit-cov`
Runs unit tests with coverage calculation option.

### `npm test:snap`
Runs snapshot tests using the Jest configuration.

### `npm test:snap-cov`
Runs snapshot tests with coverage calculation option.

### `npm test:snap-update`
Updates snap-data of snapshot tests.

### `npm test:e2e`
Executes e2e tests (Playwright)

### `npm test`
Sequentially executes unit tests, snapshot tests, integration tests, e2e tests.

### `npm storybook`
Runs Storybook in development mode on port 6006.

### `npm build-storybook`
Builds a static version of Storybook for deployment.

### `npm chromatic`
Runs Chromatic to check for visual changes in components and exits with a code 0 even if changes are detected.

### `npm docs`
Generates comprehensive documentation using TypeDoc.

### `npm version:major`
Increments the major version in `package.json` and `src/app/manifest.json`.  
For example, changes `"version": "1.2.3"` to `"version": "2.0.0"`.

### `npm version:minor`
Increments the minor version in `package.json` and `src/app/manifest.json`.  
For example, changes `"version": "1.2.3"` to `"version": "1.3.0"`.

### `npm version:patch`
Increments the patch version in `package.json` and `src/app/manifest.json`.  
For example, changes `"version": "1.2.3"` to `"version": "1.2.4"`.

### `npm update-version:major`
Automates the process of merging branches, increasing the major-version in the package.json file and manifest file, and committing the changes to the designated branch. This ensures the version is updated consistently and the changes are easily trackable in the repository.

### `npm update-version:minor`
Automates the process of merging branches, increasing the minor-version in the package.json file and manifest file, and committing the changes to the designated branch. This ensures the version is updated consistently and the changes are easily trackable in the repository.

### `npm update-version:patch`
Automates the process of merging branches, increasing the patch-version in the package.json file and manifest file, and committing the changes to the designated branch. This ensures the version is updated consistently and the changes are easily trackable in the repository.

### `npm e2e:install`
Installs Playwright deps.

### `npm run prepare`
Automatically runs after dependencies installation to set up git hooks through husky.

## Features
- Create workout lists with multiple exercises
- Track progress in interactive workout mode
- Real-time progress bars with gradient fills
- Double tap to mark sets complete
- Data persistence in localStorage with 80% warning
- Dark theme by default (light theme ready)
- Mobile-first responsive design
- Touch-friendly UI (min 44px tap targets)

## Release steps
1) run npm run update-version:patch (or :minor, :major)
2) create PR with message "[Common] Version increase vX.X.X" from "common/version-increase" into "develop"
3) create PR with message "[Testing] Release vX.X.X" from "develop" into "testing"
4) go to [Vercel project](https://vercel.com/a1exevs-projects/set-forge/deployments),
   wait for the test server update to complete and make sure everything is working
5) create PR with message "Release vX.X.X" from "testing" into "main"
6) go to [Vercel project](https://vercel.com/a1exevs-projects/set-forge/deployments),
   wait for the production server update to complete, go to the [production site](TODO) and make sure everything is working
7) go to [Github Repo Home page](https://github.com/a1exevs/set-forge) -> Tags -> Releases -> Draft a new release.

   a) create a new tag via "Choose a tag" autocomplete

   b) select "develop" branch as a target

   c) click the "Generate release notes" button, remove unnecessary notes if necessary, check PR messages and correct the messages if necessary (via PR editing)

   d) select "main" branch as a target

   e) click the "Publish release"
8) checkout "testing" and pull, then merge "main" into "testing" and push
9) checkout "develop" and pull, then merge "testing" into "develop" and push
10) update RELEASE-NOTES.md with using generated notes in step 7, create PR with from "common/release-notes-update-vX.X.X" to "develop" message "[Common] RELEASE-NOTES.md update vX.X.X"

## Repository
Link to repository https://github.com/a1exevs/set-forge.

Link to project https://github.com/users/a1exevs/projects/9

## Useful links
Nu Html Checker - https://validator.w3.org/nu/
