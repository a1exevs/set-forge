// Keeps the database migrations safe for an update (see .claude/rules/database-migrations.md): the previous release
// runs on the new schema until the switch, so a migration newer than BASELINE whose `up` narrows the schema — drops,
// renames or changes a column, a table or a view — must carry `@contract vX.Y.Z`, the release that stopped using it,
// or `@compatible <how>` when the same migration keeps the old shape working (a renamed table kept as a view).
// Only `up` is read: every `down` of an additive migration removes what it added.
// Exit code 1 lists every violation.

import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import { rootDir } from './common.ts';

const MIGRATIONS_DIR = join(rootDir, 'server', 'database', 'migrations');
/** The newest migration written before the rule; older ones are history and stay as they are. */
const BASELINE = '20261118120000';
const MARKER = /@contract[ \t]+v\d+\.\d+\.\d+\b|@compatible[ \t]+\S/;
const NARROWING: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  {
    name: 'queryInterface call',
    pattern: /\b(removeColumn|renameColumn|renameTable|dropTable|dropAllTables|changeColumn)\s*\(/,
  },
  { name: 'DROP / RENAME TABLE or VIEW', pattern: /\b(DROP|RENAME)\s+(TABLE|VIEW)\b/i },
  {
    name: 'ALTER TABLE … DROP / RENAME / MODIFY / CHANGE',
    pattern:
      /\bALTER\s+TABLE\b[^;]*?\b(DROP|RENAME|MODIFY|CHANGE)\b(?!\s+(INDEX|KEY|FOREIGN|CONSTRAINT|PRIMARY|CHECK)\b)/i,
  },
];

type Migration = { up?: unknown };

const load = createRequire(import.meta.url);
const errors: string[] = [];
let checked = 0;

for (const name of readdirSync(MIGRATIONS_DIR).sort()) {
  if (!name.endsWith('.js') || name.slice(0, BASELINE.length) <= BASELINE) {
    continue;
  }
  checked += 1;
  const path = join(MIGRATIONS_DIR, name);
  const migration: Migration = load(path);
  if (typeof migration.up !== 'function') {
    errors.push(`${name}: no \`up\` function`);
    continue;
  }
  const found = NARROWING.filter(({ pattern }) => pattern.test(migration.up?.toString() ?? '')).map(
    ({ name: what }) => what,
  );
  if (found.length > 0 && !MARKER.test(readFileSync(path, 'utf8'))) {
    errors.push(
      `${name}: \`up\` narrows the schema (${found.join(', ')}), while the previous release still runs on it ` +
        'during an update. Expand now — add the new shape and keep the old one — and contract in a later ' +
        'migration once no release reads the old shape, marked `@contract vX.Y.Z` with the release that stopped ' +
        'using it — or, when this migration keeps the old shape working itself, mark it `@compatible <how>` ' +
        '(.claude/rules/database-migrations.md).',
    );
  }
}

if (errors.length > 0) {
  process.stderr.write(`Migration check failed:\n${errors.map(error => `  - ${error}`).join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(`Migrations OK: ${checked} after ${BASELINE} checked, none narrows the schema unmarked.\n`);
