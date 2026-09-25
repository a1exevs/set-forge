#!/usr/bin/env node
// Keeps the domain docs (docs/domains/*.md) thin and pointing at real code (see .cursor/rules/domain-docs.mdc):
//   1. one `# Title`, then exactly Glossary, Invariants, Flows, Map (+ optional Related); at most MAX_LINES lines;
//   2. Invariants is `| Id | Invariant |`; tests prove an invariant with `// @invariant <domain>/<id>`, and both sides
//      agree: a tagged invariant is not `❌ review`, an untagged one is, every tag names a real invariant;
//   3. Map is `| Part | Code |`: each row points to existing code;
//   4. every backticked path and every relative link in a doc resolves — a rename breaks the lint, not the doc;
//   5. every client entity / feature / page / widget, every server domain module and every server model appears in
//      some Map.
// Exit code 1 lists every violation.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const clientDir = join(fileURLToPath(import.meta.url), '..', '..');
const repoRoot = join(clientDir, '..');
const docsDir = join(repoRoot, 'docs', 'domains');

const SECTIONS = ['Glossary', 'Invariants', 'Flows', 'Map'];
const OPTIONAL_LAST = 'Related';
const MAX_LINES = 150;
const PATH_PREFIXES = ['client/', 'server/', 'docs/', '.cursor/'];
const TEST_FILE = /(\.spec\.(unit|snap|e2e)\.tsx?|\.spec\.ts|\.e2e-spec\.ts)$/;
const REVIEW = '❌ review';
/** Server modules that are infrastructure, not a domain. */
const INFRA_MODULES = new Set(['app', 'health', 'logger']);

const problems = [];
const rel = path => relative(repoRoot, path).split('\\').join('/');
const dirs = path =>
  existsSync(path)
    ? readdirSync(path, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
    : [];

const backtickedPaths = text =>
  [...text.matchAll(/`([^`\s]+)`/g)]
    .map(match => match[1])
    .filter(token => PATH_PREFIXES.some(prefix => token.startsWith(prefix)));

function tableRows(section, header) {
  const rows = section
    .split('\n')
    .filter(line => line.startsWith('|'))
    .map(line =>
      line
        .trim()
        .slice(1, -1)
        .split(/(?<!\\)\|/)
        .map(cell => cell.trim()),
    );
  if (rows[0]?.join('|') !== header.join('|') || !/^-+$/.test(rows[1]?.[0] ?? '')) {
    return null;
  }
  return rows.slice(2);
}

/** `## Name` sections outside fenced code: { name, body }. */
function sections(body) {
  const lines = body.split('\n');
  const found = [];
  let fenced = false;
  lines.forEach((line, index) => {
    if (line.startsWith('```')) {
      fenced = !fenced;
    } else if (!fenced && line.startsWith('## ')) {
      found.push({ name: line.slice(3).trim(), start: index });
    }
  });
  return found.map((section, index) => ({
    name: section.name,
    body: lines.slice(section.start + 1, found[index + 1]?.start ?? lines.length).join('\n'),
  }));
}

const mapPaths = [];
/** `<domain>/<id>` → where it is declared and whether it is marked `❌ review`. */
const invariantsById = new Map();

for (const name of existsSync(docsDir) ? readdirSync(docsDir).filter(entry => entry.endsWith('.md')) : []) {
  const path = join(docsDir, name);
  const file = rel(path);
  const text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  const lines = text.trimEnd().split('\n');

  if (!/^[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(name)) {
    problems.push(`${file}: name the doc after the domain in kebab-case`);
  }
  if (lines.length > MAX_LINES) {
    problems.push(`${file}: ${lines.length} lines — keep a domain doc under ${MAX_LINES}; point to code instead`);
  }
  if (!lines[0]?.startsWith('# ') || lines.filter(line => /^# /.test(line)).length !== 1) {
    problems.push(`${file}: start with exactly one \`# Title\``);
  }

  const found = sections(text);
  const names = found.map(section => section.name);
  const expected = names.at(-1) === OPTIONAL_LAST ? [...SECTIONS, OPTIONAL_LAST] : SECTIONS;
  if (names.join('|') !== expected.join('|')) {
    problems.push(`${file}: sections must be ${SECTIONS.join(', ')} (+ ${OPTIONAL_LAST}) — found ${names.join(', ')}`);
  }

  const invariants = found.find(section => section.name === 'Invariants');
  const invariantRows = invariants && tableRows(invariants.body, ['Id', 'Invariant']);
  if (invariants && !invariantRows) {
    problems.push(`${file}: Invariants must be a \`| Id | Invariant |\` table`);
  }
  const domain = name.replace(/\.md$/, '');
  for (const [id, text] of invariantRows ?? []) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id ?? '')) {
      problems.push(`${file}: invariant id "${id}" must be kebab-case`);
    }
    const key = `${domain}/${id}`;
    if (invariantsById.has(key)) {
      problems.push(`${file}: invariant id "${id}" is used twice`);
    }
    invariantsById.set(key, { file, review: (text ?? '').includes(REVIEW) });
  }

  const map = found.find(section => section.name === 'Map');
  const mapRows = map && tableRows(map.body, ['Part', 'Code']);
  if (map && !mapRows) {
    problems.push(`${file}: Map must be a \`| Part | Code |\` table`);
  }
  for (const [part, cell] of mapRows ?? []) {
    const paths = backtickedPaths(cell ?? '');
    if (paths.length === 0) {
      problems.push(`${file}: Map row "${part}" names no code path`);
    }
    mapPaths.push(...paths);
  }

  for (const token of backtickedPaths(text)) {
    if (!existsSync(join(repoRoot, token))) {
      problems.push(`${file}: \`${token}\` does not exist — renamed or removed? Update the doc`);
    }
  }
  for (const [, target] of text.matchAll(/\]\(([^)#\s]+)(#[^)]*)?\)/g)) {
    if (!/^[a-z]+:/.test(target) && !existsSync(join(dirname(path), target))) {
      problems.push(`${file}: link \`${target}\` does not resolve`);
    }
  }
}

// Invariants ↔ tests: a test proves an invariant by a `// @invariant <domain>/<id>` comment. Both directions must
// agree — a tagged invariant can't stay `❌ review`, an untagged one must say so, a tag must name a real invariant.
const TAG = /@invariant\s+([a-z0-9-]+\/[a-z0-9-]+)/g;
const testsById = new Map();
function scanTags(dir) {
  for (const entry of existsSync(dir) ? readdirSync(dir, { withFileTypes: true }) : []) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', '__snapshots__', 'coverage'].includes(entry.name)) {
        scanTags(path);
      }
      continue;
    }
    if (!/\.(tsx?|cjs|mjs)$/.test(entry.name) || path.includes(join('client', 'scripts'))) {
      continue;
    }
    for (const [, key] of readFileSync(path, 'utf8').matchAll(TAG)) {
      if (!TEST_FILE.test(entry.name)) {
        problems.push(`${rel(path)}: \`@invariant ${key}\` outside a test file — tag the test that proves it`);
      }
      testsById.set(key, [...(testsById.get(key) ?? []), rel(path)]);
    }
  }
}
for (const dir of ['client/src', 'client/tests', 'server/src', 'server/test']) {
  scanTags(join(repoRoot, dir));
}
for (const [key, { file, review }] of invariantsById) {
  const tests = testsById.get(key) ?? [];
  if (tests.length > 0 && review) {
    problems.push(`${file}: invariant "${key}" is proven by ${tests.join(', ')} — drop \`${REVIEW}\``);
  }
  if (tests.length === 0 && !review) {
    problems.push(
      `${file}: no test tagged \`// @invariant ${key}\` — tag the test that proves it or mark \`${REVIEW}\``,
    );
  }
}
for (const [key, tests] of testsById) {
  if (!invariantsById.has(key)) {
    problems.push(
      `${tests.join(', ')}: \`@invariant ${key}\` names no invariant in docs/domains — add it or fix the tag`,
    );
  }
}

// Coverage: every place that owns domain code is mapped by some doc.
/** Widgets that are app chrome, not part of a domain. */
const APP_CHROME = new Set(['client/src/widgets/main-tabs-bar']);
const serverModels = [];
(function findModels(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      findModels(path);
    } else if (entry.name.endsWith('.model.ts')) {
      serverModels.push(rel(path));
    }
  }
})(join(repoRoot, 'server', 'src'));
for (const model of serverModels) {
  if (!mapPaths.includes(model)) {
    problems.push(`${model}: not in any docs/domains/*.md Map (Models row) — add the table to its domain doc`);
  }
}
const required = [
  ...['entities', 'features', 'pages', 'widgets'].flatMap(layer =>
    dirs(join(clientDir, 'src', layer))
      .map(slice => `client/src/${layer}/${slice}`)
      .filter(slice => !APP_CHROME.has(slice)),
  ),
  ...dirs(join(repoRoot, 'server', 'src'))
    .filter(module => !INFRA_MODULES.has(module))
    .filter(module => readdirSync(join(repoRoot, 'server', 'src', module)).some(f => f.endsWith('.module.ts')))
    .map(module => `server/src/${module}`),
];
const mapped = new Set(mapPaths.map(path => path.replace(/\/$/, '')));
for (const owner of required) {
  const covered = [...mapped].some(
    path =>
      path === owner ||
      path.startsWith(`${owner}/`) ||
      (statSync(join(repoRoot, owner)).isDirectory() && owner.startsWith(`${path}/`)),
  );
  if (!covered) {
    problems.push(`${owner}: not in any docs/domains/*.md Map — add it to the doc of its domain`);
  }
}

if (problems.length > 0) {
  process.stderr.write(`Domain docs check failed:\n${problems.map(problem => `  ✘ ${problem}`).join('\n')}\n`);
  process.exit(1);
}
process.stdout.write('Domain docs OK: fixed sections, every path resolves, every domain slice / module is mapped.\n');
