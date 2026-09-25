#!/usr/bin/env node
// Keeps the agent rules (.cursor/rules/*.mdc) in one shape and their `## Enforcement` sections truthful:
//   1. frontmatter: exactly `description`, `globs` (comma-separated string), `alwaysApply` (true / false);
//      the static part of every glob exists;
//   2. one `# Title`; `## Enforcement` is the last section (`## Related`, when present, right before it);
//   3. Enforcement is a `| Rule | Checked by |` table; every row names a check or says `❌ review`;
//   4. every reference in "Checked by" resolves: `npm run <script>` exists in the root package.json, a path exists,
//      ESLint `<rule>` is enabled in the linted project(s), Steiger `<rule>` exists in the FSD plugin.
// Exit code 1 lists every violation.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import fsd from '@feature-sliced/steiger-plugin';
import { ESLint } from 'eslint';

const clientDir = join(fileURLToPath(import.meta.url), '..', '..');
const repoRoot = join(clientDir, '..');
const rulesDir = join(repoRoot, '.cursor', 'rules');

const FRONTMATTER_KEYS = ['description', 'globs', 'alwaysApply'];
const PATH_PREFIXES = ['client/', 'server/', '.cursor/', 'docs/', 'scripts/'];
const REVIEW = '❌ review';

const problems = [];
const rel = path => relative(repoRoot, path).split('\\').join('/');
const rootScripts = new Set(Object.keys(JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8')).scripts));
const steigerRules = new Set(fsd.plugin.ruleDefinitions.map(rule => rule.name));

function sourceFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', '__snapshots__'].includes(entry.name)) {
        sourceFiles(path, out);
      }
    } else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      out.push(path);
    }
  }
  return out;
}

/** Rules enabled for at least one file of the project — what `npm run <project>:lint` actually checks. */
async function enabledEslintRules(projectDir, roots) {
  const eslint = new ESLint({ cwd: projectDir });
  const enabled = new Set();
  for (const file of roots.flatMap(root => sourceFiles(join(projectDir, root)))) {
    if (await eslint.isPathIgnored(file)) {
      continue;
    }
    const config = await eslint.calculateConfigForFile(file);
    for (const [rule, setting] of Object.entries(config?.rules ?? {})) {
      const severity = Array.isArray(setting) ? setting[0] : setting;
      if (severity !== 0 && severity !== 'off') {
        enabled.add(rule);
      }
    }
  }
  return enabled;
}

const eslintRules = {
  client: await enabledEslintRules(clientDir, ['src', 'linter', 'tests', '.storybook']),
  server: await enabledEslintRules(join(repoRoot, 'server'), ['src', 'test']),
};

function parseFrontmatter(file, text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) {
    problems.push(`${file}: no frontmatter`);
    return null;
  }
  const lines = match[1].split('\n');
  const keys = lines.map(line => /^([A-Za-z]+):/.exec(line)?.[1]);
  if (keys.some(key => key === undefined) || keys.join() !== FRONTMATTER_KEYS.join()) {
    problems.push(`${file}: frontmatter must be exactly ${FRONTMATTER_KEYS.join(', ')} (one line each, in this order)`);
    return null;
  }
  const fields = Object.fromEntries(lines.map(line => [line.split(':')[0], line.slice(line.indexOf(':') + 1).trim()]));
  if (!fields.description) {
    problems.push(`${file}: empty description`);
  }
  if (!['true', 'false'].includes(fields.alwaysApply)) {
    problems.push(`${file}: alwaysApply must be true or false`);
  }
  if (!fields.globs || /[[\]"']/.test(fields.globs)) {
    problems.push(
      `${file}: globs must be a comma-separated string (\`globs: client/**, server/**\`), no array or quotes`,
    );
  } else {
    for (const glob of fields.globs.split(',').map(part => part.trim())) {
      const staticPart = glob
        .split('/')
        .filter((_, index, parts) => !parts.slice(0, index + 1).some(p => /[*?{]/.test(p)));
      if (!existsSync(join(repoRoot, ...staticPart))) {
        problems.push(`${file}: glob \`${glob}\` points to \`${staticPart.join('/')}\`, which does not exist`);
      }
    }
  }
  return match[0].length;
}

/** Headings outside fenced code blocks. */
function headings(body) {
  const result = [];
  let fenced = false;
  body.split('\n').forEach((line, index) => {
    if (line.startsWith('```')) {
      fenced = !fenced;
    } else if (!fenced && /^#{1,2} /.test(line)) {
      result.push({ level: line.startsWith('## ') ? 2 : 1, text: line.replace(/^#+ /, ''), index });
    }
  });
  return result;
}

function checkReferences(file, rule, cell) {
  const eslintIds = [...cell.matchAll(/ESLint `([^`]+)`/g)].map(match => match[1]);
  const steigerIds = [...cell.matchAll(/Steiger `([^`]+)`/g)].map(match => match[1]);
  const scripts = [...cell.matchAll(/`npm run ([^`\s]+)`/g)].map(match => match[1]);
  const paths = [...cell.matchAll(/`([^`]+)`/g)]
    .map(match => match[1])
    .filter(token => PATH_PREFIXES.some(prefix => token.startsWith(prefix)));

  for (const script of scripts) {
    if (!rootScripts.has(script)) {
      problems.push(`${file}: "${rule}" — \`npm run ${script}\` is not a script of the root package.json`);
    }
  }
  const projects = ['client', 'server'].filter(project => scripts.includes(`${project}:lint`));
  for (const id of eslintIds) {
    for (const project of projects.length > 0 ? projects : ['client']) {
      if (!eslintRules[project].has(id)) {
        problems.push(`${file}: "${rule}" — ESLint \`${id}\` is not enabled in ${project}`);
      }
    }
  }
  for (const id of steigerIds) {
    if (!steigerRules.has(id)) {
      problems.push(`${file}: "${rule}" — Steiger \`${id}\` is not a rule of @feature-sliced/steiger-plugin`);
    }
  }
  for (const path of paths) {
    if (!existsSync(join(repoRoot, path))) {
      problems.push(`${file}: "${rule}" — \`${path}\` does not exist`);
    }
  }
  const references = eslintIds.length + steigerIds.length + scripts.length + paths.length + /\bknip\b/.test(cell);
  if (!cell.includes(REVIEW) && references === 0) {
    problems.push(`${file}: "${rule}" — name a check (npm script, ESLint / Steiger rule, file) or write \`${REVIEW}\``);
  }
}

function checkEnforcement(file, section) {
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
  if (rows[0]?.join('|') !== 'Rule|Checked by' || !/^-+$/.test(rows[1]?.[0] ?? '')) {
    problems.push(`${file}: Enforcement must be a \`| Rule | Checked by |\` table`);
    return;
  }
  if (rows.length < 3) {
    problems.push(`${file}: Enforcement table has no rows`);
  }
  for (const [rule, cell, ...rest] of rows.slice(2)) {
    if (!rule || !cell || rest.length > 0) {
      problems.push(`${file}: Enforcement row "${rule ?? ''}" must have exactly two cells`);
      continue;
    }
    checkReferences(file, rule, cell);
  }
}

for (const name of readdirSync(rulesDir).filter(entry => entry.endsWith('.mdc'))) {
  const path = join(rulesDir, name);
  const file = rel(path);
  const text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  const bodyStart = parseFrontmatter(file, text);
  if (bodyStart === null) {
    continue;
  }
  const body = text.slice(bodyStart);
  const found = headings(body);
  const titles = found.filter(heading => heading.level === 1);
  const sections = found.filter(heading => heading.level === 2);
  if (titles.length !== 1 || found[0]?.level !== 1) {
    problems.push(`${file}: exactly one \`# Title\`, before every section`);
  }
  const last = sections.at(-1);
  if (last?.text !== 'Enforcement') {
    problems.push(`${file}: \`## Enforcement\` must be the last section`);
    continue;
  }
  const related = sections.findIndex(heading => heading.text === 'Related');
  if (related !== -1 && related !== sections.length - 2) {
    problems.push(`${file}: \`## Related\` goes right before \`## Enforcement\``);
  }
  checkEnforcement(
    file,
    body
      .split('\n')
      .slice(last.index + 1)
      .join('\n'),
  );
}

if (problems.length > 0) {
  process.stderr.write(`Rules check failed:\n${problems.map(problem => `  ✘ ${problem}`).join('\n')}\n`);
  process.exit(1);
}
process.stdout.write('Rules OK: unified structure, every Enforcement reference resolves.\n');
