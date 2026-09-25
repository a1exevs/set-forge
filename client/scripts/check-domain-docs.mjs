#!/usr/bin/env node
// Keeps the domain docs (docs/domains/*.md) thin and pointing at real code (see .cursor/rules/domain-docs.mdc):
//   1. one `# Title`, then exactly Glossary, Invariants, Flows, Map (+ optional Related); at most MAX_LINES lines;
//   2. Invariants is `| Invariant | Checked by |`: each row points to existing test files or says `❌ review`;
//   3. Map is `| Part | Code |`: each row points to existing code;
//   4. every backticked path and every relative link in a doc resolves — a rename breaks the lint, not the doc;
//   5. every client entity / feature / page and every server domain module appears in some Map.
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
const TEST_FILE = /(\.spec\.(unit|snap)\.tsx?|\.spec\.ts|\.e2e-spec\.ts)$/;
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
  const invariantRows = invariants && tableRows(invariants.body, ['Invariant', 'Checked by']);
  if (invariants && !invariantRows) {
    problems.push(`${file}: Invariants must be a \`| Invariant | Checked by |\` table`);
  }
  for (const [rule, cell] of invariantRows ?? []) {
    const tests = backtickedPaths(cell ?? '').filter(token => TEST_FILE.test(token));
    if (!cell?.includes(REVIEW) && tests.length === 0) {
      problems.push(`${file}: invariant "${rule}" — point to the test that proves it, or write \`${REVIEW}\``);
    }
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

// Coverage: every place that owns domain code is mapped by some doc.
const required = [
  ...['entities', 'features', 'pages'].flatMap(layer =>
    dirs(join(clientDir, 'src', layer)).map(slice => `client/src/${layer}/${slice}`),
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
