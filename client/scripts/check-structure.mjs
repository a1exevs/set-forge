#!/usr/bin/env node
// Structural FSD checks that neither ESLint nor Steiger cover (see .claude/rules/fsd-architecture.md):
//   1. `src` root holds only the layers and `vite-env.d.ts` (the entry point is `app/entrypoint/main.tsx`);
//   2. slice root holds only `index.ts`, segment folders and (entities) the `@x` folder;
//   3. `index.ts`: required for every slice and every `shared` segment (their public API); forbidden in layers,
//      in `app` and anywhere inside the segments of a slice — outsiders use the slice index, insiders import files;
//      `index.tsx` likewise, except the TanStack route `app/routes/index.tsx` (the `/` route);
//   4. segments: the five standard ones in slices; `app` / `shared` segments from an explicit list (named by purpose);
//   5. `@x/<consumer>.ts` names an existing entity other than its owner;
//   6. names by purpose: no `components/`, `hooks/`, `types/`, `utils/`, `helpers/`, `consts/`, `contexts/` folders,
//      no `types.ts` / `consts.ts` / `utils.ts` / `*.types.ts` / `*.store.ts` files;
//   7. tests live in `specs/` folders (Jest picks them up there), and `specs/` holds only tests and their helpers;
//   8. kebab-case file and folder names (TanStack route files `__root.tsx` / `$id.tsx` excepted);
//   9. no `export *` anywhere in src; no `eslint-disable` of FSD boundary rules, no blanket `eslint-disable`.
// Exit code 1 lists every violation.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const clientDir = join(fileURLToPath(import.meta.url), '..', '..');
const srcDir = join(clientDir, 'src');

const SLICE_SEGMENTS = new Set(['ui', 'model', 'api', 'lib', 'config']);
const SHARED_SEGMENTS = new Set(['ui', 'model', 'api', 'lib', 'config']);
const APP_SEGMENTS = new Set(['api', 'entrypoint', 'router', 'routes', 'styles']);
const SLICED_LAYERS = ['pages', 'widgets', 'features', 'entities'];
const LAYERS = new Set(['app', ...SLICED_LAYERS, 'shared']);
const SRC_ROOT_FILES = new Set(['vite-env.d.ts']);

const BANNED_FOLDERS = new Set([
  'components',
  'hooks',
  'types',
  'utils',
  'helpers',
  'consts',
  'constants',
  'contexts',
  'services',
  'providers',
  'store',
]);
const BANNED_FILE =
  /^(types|consts|constants|utils|helpers)\.tsx?$|\.(types|consts|constants|utils|helpers|store)\.tsx?$/;
const SPEC_FILE = /\.spec\.(unit|snap)\.tsx?$/;
const SPEC_HELPERS = new Set(['test-utils.tsx', 'test-utils.ts']);

/** kebab-case segments separated by dots: `home-page.tsx`, `button.module.scss`, `button.spec.unit.tsx`. */
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*)*$/;
/** TanStack Router file routes: `__root.tsx`, `$id.tsx`. */
const ROUTE_FILE = /^(__root|\$[a-z][a-zA-Z0-9]*)\.tsx$/;
const KEBAB_ROOTS = ['src', 'tests', 'linter', 'scripts'];
const SKIP_NAMES = new Set(['node_modules', '__snapshots__', '__mocks__', '@x']);

const problems = [];
const rel = path => relative(clientDir, path).split('\\').join('/');
const entries = dir => readdirSync(dir, { withFileTypes: true });

function walkFiles(dir, visit) {
  for (const entry of entries(dir)) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__snapshots__') {
        visit(path, entry, true);
        walkFiles(path, visit);
      }
    } else {
      visit(path, entry, false);
    }
  }
}

function checkSegments(owner, dir, { allowed, index }) {
  for (const entry of entries(dir)) {
    const path = join(dir, entry.name);
    if (!entry.isDirectory()) {
      if (entry.name !== 'index.ts' || owner === 'app') {
        problems.push(`${rel(path)}: files directly in ${owner} — put them into a segment`);
      }
      continue;
    }
    if (entry.name === '@x' && owner.startsWith('entities/')) {
      checkCrossImportApi(owner, path);
      continue;
    }
    if (!allowed.has(entry.name)) {
      problems.push(`${rel(path)}: "${entry.name}" is not an allowed segment of ${owner} (${[...allowed].join(', ')})`);
      continue;
    }
    const hasIndex = existsSync(join(path, 'index.ts'));
    if (index === 'required' && !hasIndex) {
      problems.push(`${rel(path)}: shared segment has no index.ts (its public API)`);
    }
    if (index === 'forbidden') {
      walkFiles(path, (file, fileEntry, isDir) => {
        // `routes/index.tsx` is the TanStack file route of `/`, not a segment index.
        const isIndexRoute = fileEntry.name === 'index.tsx' && rel(file).startsWith('src/app/routes/');
        if (!isDir && /^index\.tsx?$/.test(fileEntry.name) && !isIndexRoute) {
          problems.push(
            `${rel(file)}: no index.ts / index.tsx inside segments — re-export from files in the slice index`,
          );
        }
      });
    }
  }
}

function checkCrossImportApi(owner, dir) {
  const entities = new Set(
    entries(join(srcDir, 'entities'))
      .filter(e => e.isDirectory())
      .map(e => e.name),
  );
  const ownSlice = owner.split('/')[1];
  for (const entry of entries(dir)) {
    const consumer = entry.name.replace(/\.ts$/, '');
    if (entry.isDirectory() || !entry.name.endsWith('.ts') || !entities.has(consumer) || consumer === ownSlice) {
      problems.push(`${rel(join(dir, entry.name))}: @x holds \`<consumer-entity>.ts\` files for other entities only`);
    }
  }
}

function checkFsd() {
  for (const entry of entries(srcDir)) {
    const path = join(srcDir, entry.name);
    if (entry.isDirectory()) {
      if (!LAYERS.has(entry.name)) {
        problems.push(`${rel(path)}: unknown FSD layer`);
      }
    } else if (!SRC_ROOT_FILES.has(entry.name)) {
      problems.push(`${rel(path)}: unexpected file in src root`);
    }
  }

  for (const layer of SLICED_LAYERS) {
    const layerDir = join(srcDir, layer);
    if (!existsSync(layerDir)) {
      continue;
    }
    for (const slice of entries(layerDir)) {
      const slicePath = join(layerDir, slice.name);
      if (!slice.isDirectory()) {
        problems.push(`${rel(slicePath)}: files directly in a layer — layers have no public API, use a slice`);
        continue;
      }
      if (!existsSync(join(slicePath, 'index.ts'))) {
        problems.push(`${rel(slicePath)}: slice has no index.ts`);
      }
      checkSegments(`${layer}/${slice.name}`, slicePath, { allowed: SLICE_SEGMENTS, index: 'forbidden' });
    }
  }

  const app = join(srcDir, 'app');
  if (existsSync(app)) {
    checkSegments('app', app, { allowed: APP_SEGMENTS, index: 'forbidden' });
  }

  const shared = join(srcDir, 'shared');
  if (existsSync(shared)) {
    checkSegments('shared', shared, { allowed: SHARED_SEGMENTS, index: 'required' });
  }
}

function checkNamesByPurpose() {
  walkFiles(srcDir, (path, entry, isDir) => {
    if (isDir && BANNED_FOLDERS.has(entry.name)) {
      problems.push(`${rel(path)}: "${entry.name}/" names the essence, not the purpose — see fsd-architecture §4`);
    }
    if (!isDir && BANNED_FILE.test(entry.name)) {
      problems.push(`${rel(path)}: name the file by purpose (\`workout-list.ts\`, \`breakpoints.ts\`), not by essence`);
    }
  });
}

function checkSpecs() {
  walkFiles(srcDir, (path, entry, isDir) => {
    const inSpecs = rel(path).split('/').slice(0, -1).includes('specs');
    if (!isDir && SPEC_FILE.test(entry.name) && !inSpecs) {
      problems.push(`${rel(path)}: tests live in a specs/ folder next to the code they test`);
    }
    if (!isDir && inSpecs && !SPEC_FILE.test(entry.name) && !SPEC_HELPERS.has(entry.name)) {
      problems.push(`${rel(path)}: specs/ holds only *.spec.unit|snap files and test-utils`);
    }
  });
}

/** Rules that carry the FSD boundaries: switching them off in a file bypasses the architecture silently. */
const FSD_RULES = [
  'no-restricted-imports',
  '@typescript-eslint/no-restricted-imports',
  'import/no-restricted-paths',
  'import/no-cycle',
  'no-restricted-syntax',
  '@typescript-eslint/consistent-type-definitions',
];
const DISABLE_DIRECTIVE = /eslint-disable(?:-next-line|-line)?(?<rules>[^\n*]*)/g;

function checkSources() {
  walkFiles(srcDir, (path, entry, isDir) => {
    if (isDir || !/\.tsx?$/.test(entry.name) || entry.name === 'route-tree.gen.ts') {
      return;
    }
    const text = readFileSync(path, 'utf8');
    // Wildcard re-exports hide what a public API exposes (FSD public-api guide); no linter flags them.
    if (/^\s*export\s+\*/m.test(text)) {
      problems.push(`${rel(path)}: no \`export *\` — list the public names explicitly`);
    }
    for (const match of text.matchAll(DISABLE_DIRECTIVE)) {
      const rules = match.groups.rules.split('--')[0].trim();
      if (rules === '') {
        problems.push(`${rel(path)}: blanket \`${match[0].trim()}\` — name the rule being disabled`);
      } else if (FSD_RULES.some(rule => rules.split(/[\s,]+/).includes(rule))) {
        problems.push(`${rel(path)}: \`${match[0].trim()}\` switches off an FSD boundary — fix the import instead`);
      }
    }
  });
}

function checkKebab(dir) {
  for (const entry of entries(dir)) {
    if (SKIP_NAMES.has(entry.name)) {
      continue;
    }
    const path = join(dir, entry.name);
    const isRouteFile = rel(path).startsWith('src/app/routes/') && ROUTE_FILE.test(entry.name);
    if (!KEBAB.test(entry.name) && !isRouteFile) {
      problems.push(`${rel(path)}: name is not kebab-case`);
    }
    if (entry.isDirectory()) {
      checkKebab(path);
    }
  }
}

checkFsd();
checkNamesByPurpose();
checkSpecs();
checkSources();
for (const dir of KEBAB_ROOTS.map(name => join(clientDir, name)).filter(existsSync)) {
  checkKebab(dir);
}

if (problems.length > 0) {
  process.stderr.write(`Structure check failed:\n${problems.map(problem => `  ✘ ${problem}`).join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(
  'Structure OK: FSD layers/slices/segments, public API, names by purpose, specs, kebab-case, no export * / FSD disables.\n',
);
