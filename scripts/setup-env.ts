// Bootstraps the env files from their committed examples and keeps the MySQL credentials of the
// compose stack (root .env) and the API (server/.development.env, or server/.production.env with
// --prod) in sync. Needs Node only (no `npm install`): it uses nothing but node:fs and node:path.
//
//   npm run setup:env                   # dev: .env, server/.development.env, server/.e2e.env
//                                       # exit 1 on a credentials mismatch or a missing *.example, 2 on a bad option
//   npm run setup:env -- --prod         # prod (VDS): .env, server/.production.env
//   npm run setup:env -- --fix          # additionally copy the root MySQL values into the server env file
//
// Existing files are never overwritten. Values are never printed — only key names — so the
// output is safe for logs and for an agent that is not allowed to read env files.

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
let fix = false;
let prod = false;
for (const arg of process.argv.slice(2)) {
  if (arg === '--fix') {
    fix = true;
  } else if (arg === '--prod') {
    prod = true;
  } else {
    process.stderr.write(`unknown option: ${arg} (expected --prod and/or --fix)\n`);
    process.exit(2);
  }
}

const created: string[] = [];
const kept: string[] = [];
const mismatched: string[] = [];
const warnings: string[] = [];
const errors: string[] = [];

const rel = (path: string): string => relative(ROOT, path).split('\\').join('/');

/** Copies the example when the target is missing. */
function ensure(target: string, example: string): void {
  if (existsSync(target)) {
    kept.push(rel(target));
  } else if (existsSync(example)) {
    copyFileSync(example, target);
    created.push(rel(target));
  } else {
    errors.push(`example missing: ${rel(example)} — the checkout is incomplete`);
  }
}

const keyLine = (key: string): RegExp => new RegExp(`^\\s*(export\\s+)?${key}=`);
const lines = (file: string): string[] => readFileSync(file, 'utf8').split('\n');

/**
 * Value of the last KEY=... line (dotenv keeps the last one). A quoted value runs up to its closing quote — the last
 * one on the line, so an escaped \" inside survives; an inline comment after it, like the trailing "# comment" of an
 * unquoted value, is dropped. Empty when absent.
 */
function readVar(file: string, key: string): string {
  const line = lines(file)
    .filter(candidate => keyLine(key).test(candidate))
    .at(-1);
  if (line === undefined) {
    return '';
  }
  const value = line.slice(line.indexOf('=') + 1).trim();
  const quote = value[0];
  if (quote === '"' || quote === "'") {
    const unquoted = value.slice(1);
    // The closing quote is the last one followed by " # comment", or else the last character.
    let closing = -1;
    for (let index = unquoted.lastIndexOf(quote); index >= 0; index = unquoted.lastIndexOf(quote, index - 1)) {
      if (/^\s.*#/.test(unquoted.slice(index + 1))) {
        closing = index;
        break;
      }
      if (index === 0) {
        break;
      }
    }
    if (closing >= 0) {
      return unquoted.slice(0, closing);
    }
    return unquoted.endsWith(quote) ? unquoted.slice(0, -1) : unquoted;
  }
  return value.replace(/\s+#.*$/, '').trimEnd();
}

/**
 * Replaces every KEY=... line (so the last one — the one dotenv uses — is the new value too) or appends one. A value
 * with whitespace, '#' or a quote is wrapped in quotes so that it survives a round trip; backslashes are written as
 * they are, because dotenv, docker compose and server/database/config.js all keep them literal inside quotes.
 */
function setVar(file: string, key: string, value: string): void {
  let written = value;
  if (/[\s#"']/.test(value)) {
    if (!value.includes("'")) {
      written = `'${value}'`;
    } else {
      if (value.includes('"')) {
        warnings.push(`${key}: the value mixes ' and " — no env quoting represents it, check ${rel(file)} by hand`);
      }
      written = `"${value}"`;
    }
  }
  const current = lines(file);
  if (current.some(line => keyLine(key).test(line))) {
    const updated = current.map(line =>
      keyLine(key).test(line) ? `${key}=${written}${line.endsWith('\r') ? '\r' : ''}` : line,
    );
    writeFileSync(file, updated.join('\n'));
  } else {
    writeFileSync(file, `${current.join('\n')}\n${key}=${written}\n`);
  }
}

const ROOT_ENV = join(ROOT, '.env');
ensure(ROOT_ENV, join(ROOT, '.env.example'));

let SERVER_ENV: string;
if (prod) {
  SERVER_ENV = join(ROOT, 'server', '.production.env');
  ensure(SERVER_ENV, join(ROOT, 'server', '.production.env.example'));
} else {
  SERVER_ENV = join(ROOT, 'server', '.development.env');
  ensure(SERVER_ENV, join(ROOT, 'server', '.development.env.example'));
  ensure(join(ROOT, 'server', '.e2e.env'), join(ROOT, 'server', '.e2e.env.example'));
}
const SERVER_ENV_NAME = rel(SERVER_ENV);

/** Compares a root key with its server key and, with --fix, copies root → server. */
function syncPair(rootKey: string, serverKey: string, fallback = ''): void {
  const rootValue = readVar(ROOT_ENV, rootKey) || fallback;
  const serverValue = readVar(SERVER_ENV, serverKey) || fallback;
  if (!rootValue) {
    warnings.push(`root .env: ${rootKey} is not set — nothing to compare ${serverKey} against`);
    return;
  }
  if (rootValue === serverValue) {
    return;
  }
  if (fix) {
    setVar(SERVER_ENV, serverKey, rootValue);
    mismatched.push(`${rootKey} → ${serverKey} (fixed)`);
  } else {
    mismatched.push(`${rootKey} ≠ ${serverKey}`);
  }
}

if (existsSync(ROOT_ENV) && existsSync(SERVER_ENV)) {
  // docker-compose.yml (mysql / mysql-dev) ↔ server/database/config.js + app.module.ts
  syncPair('MYSQL_USER', 'MYSQL_USER');
  syncPair('MYSQL_PASSWORD', 'MYSQL_PASSWORD');
  syncPair('MYSQL_DATABASE', 'MYSQL_DB');

  const host = readVar(SERVER_ENV, 'MYSQL_HOST');
  if (prod) {
    // server-prod reaches the database by its compose service name on the internal network,
    // always on the container port; MYSQL_PUBLIC_PORT applies to mysql-dev only.
    if (host !== 'mysql') {
      warnings.push(`${SERVER_ENV_NAME}: MYSQL_HOST should be 'mysql' (the compose service) for the prod stack`);
    }
    if ((readVar(SERVER_ENV, 'MYSQL_PORT') || '3306') !== '3306') {
      warnings.push(`${SERVER_ENV_NAME}: MYSQL_PORT should be 3306 — the API talks to the mysql container directly`);
    }
  } else {
    syncPair('MYSQL_PUBLIC_PORT', 'MYSQL_PORT', '3306');
    if (!['localhost', '127.0.0.1'].includes(host || 'localhost')) {
      warnings.push(`${SERVER_ENV_NAME}: MYSQL_HOST is not localhost — mysql-dev listens on 127.0.0.1 only`);
    }
  }
}

const out = (line: string): boolean => process.stdout.write(`${line}\n`);
out('Env files');
created.forEach(file => out(`  created  ${file}`));
kept.forEach(file => out(`  kept     ${file}`));

if (mismatched.length > 0) {
  out(`MySQL credentials (root .env ↔ ${SERVER_ENV_NAME})`);
  mismatched.forEach(pair => out(`  ${pair}`));
} else {
  out(`MySQL credentials: root .env and ${SERVER_ENV_NAME} agree`);
}

warnings.forEach(warning => out(`  warning  ${warning}`));
errors.forEach(error => process.stderr.write(`  error    ${error}\n`));

if (!fix && mismatched.length > 0) {
  const fixCommand = prod ? 'npm run setup:env -- --prod --fix' : 'npm run setup:env -- --fix';
  process.stderr.write(`Run '${fixCommand}' to copy the root values into ${SERVER_ENV_NAME}.\n`);
  process.exit(1);
}
if (errors.length > 0) {
  process.exit(1);
}
