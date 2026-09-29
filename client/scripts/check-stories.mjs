#!/usr/bin/env node
// Every component has its Storybook story next to it (see .claude/rules/storybook.md):
//   1. each component of a `ui` segment — the base name of its files without the `-data-layer` / `-logic-layer` /
//      `-provider` layer suffix — has `<base>.stories.tsx` in the same folder; a stories file whose component is
//      gone is an orphan;
//   2. the meta `title` is the literal `'<Layer>/<ComponentName>'`: the FSD layer in PascalCase (Pages, Widgets,
//      Features, Entities, Shared) and the component base name in PascalCase — no variable, no other group;
//   3. page stories cover every viewport: one export ending in `Desktop4k`, `Desktop`, `Tablet` and `Mobile` each.
// Exit code 1 lists every violation.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const clientDir = join(fileURLToPath(import.meta.url), '..', '..');
const srcDir = join(clientDir, 'src');

const LAYERS = ['pages', 'widgets', 'features', 'entities', 'shared'];
const LAYER_SUFFIX = /-(data-layer|logic-layer|provider)$/;
const STORY_FILE = /\.stories\.tsx$/;
const COMPONENT_FILE = /\.tsx$/;
const TITLE = /^\s*title:\s*(.+?),?\s*$/m;
const STORY_EXPORT = /^export const (\w+)/gm;
const PAGE_VIEWPORTS = ['Desktop4k', 'Desktop', 'Tablet', 'Mobile'];
const SKIP_DIRS = new Set(['specs', '__snapshots__', '__mocks__']);

const problems = [];
const rel = path => relative(clientDir, path).split('\\').join('/');
const pascal = kebab =>
  kebab
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

/** Every `ui` segment folder: `src/shared/ui` and `src/<layer>/<slice>/ui`. */
function uiSegments() {
  const segments = [];
  for (const layer of LAYERS) {
    const layerDir = join(srcDir, layer);
    if (!existsSync(layerDir)) {
      continue;
    }
    if (layer === 'shared') {
      segments.push({ layer, dir: join(layerDir, 'ui') });
      continue;
    }
    for (const slice of readdirSync(layerDir, { withFileTypes: true })) {
      if (slice.isDirectory()) {
        segments.push({ layer, dir: join(layerDir, slice.name, 'ui') });
      }
    }
  }
  return segments.filter(segment => existsSync(segment.dir));
}

/** The folder and every nested one (component folders of `shared/ui`), tests and snapshots skipped. */
function folders(dir, out = []) {
  out.push(dir);
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) {
      folders(join(dir, entry.name), out);
    }
  }
  return out;
}

function checkFolder(layer, dir) {
  const files = readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => entry.name);
  const stories = new Set(files.filter(name => STORY_FILE.test(name)).map(name => name.replace(STORY_FILE, '')));
  const components = new Set(
    files
      .filter(name => COMPONENT_FILE.test(name) && !STORY_FILE.test(name))
      .map(name => name.replace(COMPONENT_FILE, '').replace(LAYER_SUFFIX, '')),
  );

  for (const component of components) {
    if (!stories.has(component)) {
      problems.push(`${rel(join(dir, `${component}.tsx`))}: no \`${component}.stories.tsx\` next to the component`);
    }
  }
  for (const story of stories) {
    const path = join(dir, `${story}.stories.tsx`);
    if (!components.has(story)) {
      problems.push(`${rel(path)}: orphan story — no \`${story}.tsx\` (or its layers) in this folder`);
      continue;
    }
    checkStory(layer, path, story);
  }
}

function checkStory(layer, path, component) {
  const text = readFileSync(path, 'utf8');
  const expected = `${pascal(layer)}/${pascal(component)}`;
  const title = TITLE.exec(text)?.[1];
  if (title === undefined) {
    problems.push(`${rel(path)}: the meta has no \`title\` — expected \`title: '${expected}'\``);
  } else if (title !== `'${expected}'`) {
    problems.push(`${rel(path)}: \`title: ${title}\` — expected the literal \`'${expected}'\``);
  }

  if (layer === 'pages') {
    const exports = [...text.matchAll(STORY_EXPORT)].map(match => match[1]);
    for (const viewport of PAGE_VIEWPORTS) {
      if (!exports.some(name => name.endsWith(viewport))) {
        problems.push(`${rel(path)}: no \`*${viewport}\` story — pages render in every viewport`);
      }
    }
  }
}

for (const { layer, dir } of uiSegments()) {
  for (const folder of folders(dir)) {
    checkFolder(layer, folder);
  }
}

if (problems.length > 0) {
  process.stderr.write(`Stories check failed:\n${problems.map(problem => `  ✘ ${problem}`).join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(
  'Stories OK: a stories file next to every component, titles by FSD layer, pages in every viewport.\n',
);
