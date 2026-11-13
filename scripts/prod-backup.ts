// Backs up the production database into a dated gzip file and keeps the backup folder within
// BACKUP_MAX_AGE_DAYS and BACKUP_KEEP — the bound the privacy policy promises for the personal data in the backups.
//
//   npm run prod:db:backup [-- <label>]  # BACKUP_DIR (env) or ~/set-forge-backups; the label defaults to `manual`
//                                       # exit 1 when mysql is not running or the dump is incomplete
//
// The dump never leaves the VDS and its file is readable by the owner only. Restore: DEPLOY-SELECTEL.md.

import { spawn } from 'node:child_process';
import { createWriteStream, mkdirSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { Transform } from 'node:stream';
import type { TransformCallback } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';

import { rootDir } from './common.ts';
import { composeArgs, fail, isRunning, messageOf } from './prod-compose.ts';

export const BACKUP_MAX_AGE_DAYS = 30;
export const BACKUP_KEEP = 10;

const DAY_MS = 24 * 60 * 60 * 1000;
const BACKUP_FILE = /^set-forge-\d{8}-\d{6}Z-[\w.-]+\.sql\.gz$/;
// mysqldump writes this line last, so its absence means a dump that stopped half-way.
const DUMP_COMPLETED = '-- Dump completed';
const DUMP_COMMAND =
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysqldump -uroot --single-transaction --routines --triggers ' +
  '--no-tablespaces "$MYSQL_DATABASE"';

type Backup = { name: string; path: string; modifiedAt: number };

/** The folder backups are written to; created on first use, readable by the owner only. */
export function backupDir(): string {
  const dir = resolve(process.env.BACKUP_DIR || join(homedir(), 'set-forge-backups'));
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  return dir;
}

/** `20261113-142530Z` — UTC, sortable, safe in a file name. */
function timestamp(date: Date): string {
  const iso = date.toISOString();
  return `${iso.slice(0, 10).replaceAll('-', '')}-${iso.slice(11, 19).replaceAll(':', '')}Z`;
}

/** Passes the stream through and keeps its last bytes. */
class Tail extends Transform {
  text = '';

  override _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    this.text = (this.text + chunk.toString('utf8')).slice(-512);
    callback(null, chunk);
  }
}

/** Dumps the database of the running stack; returns the path of the new backup. */
export async function backupDatabase(label: string): Promise<string> {
  if (!isRunning('mysql')) {
    throw new Error('the mysql service is not running — start the stack first (npm run prod:up)');
  }
  const safeLabel = label.replace(/[^\w.-]/g, '-');
  const path = join(backupDir(), `set-forge-${timestamp(new Date())}-${safeLabel}.sql.gz`);
  const partial = `${path}.partial`;

  const dump = spawn('docker', composeArgs(['exec', '-T', 'mysql', 'sh', '-c', DUMP_COMMAND]), {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  const exited = new Promise<number | null>((resolveExit, rejectExit) => {
    dump.on('error', rejectExit);
    dump.on('close', resolveExit);
  });
  const tail = new Tail();
  try {
    await pipeline(dump.stdout, tail, createGzip(), createWriteStream(partial, { mode: 0o600 }));
    const status = await exited;
    if (status !== 0) {
      throw new Error(`mysqldump exited with status ${status}`);
    }
    if (!tail.text.includes(DUMP_COMPLETED)) {
      throw new Error(`the dump is incomplete: no "${DUMP_COMPLETED}" line at its end`);
    }
  } catch (error) {
    rmSync(partial, { force: true });
    throw error;
  }
  renameSync(partial, path);
  return path;
}

/** Backups in the folder, newest first. */
function listBackups(dir: string): Backup[] {
  return readdirSync(dir)
    .filter(name => BACKUP_FILE.test(name))
    .map(name => {
      const path = join(dir, name);
      return { name, path, modifiedAt: statSync(path).mtimeMs };
    })
    .sort((a, b) => b.modifiedAt - a.modifiedAt);
}

/** Removes backups older than BACKUP_MAX_AGE_DAYS and all but the BACKUP_KEEP newest; returns their names. */
export function pruneBackups(now = Date.now()): string[] {
  const oldest = now - BACKUP_MAX_AGE_DAYS * DAY_MS;
  const removed = listBackups(backupDir()).filter(
    (backup, index) => index >= BACKUP_KEEP || backup.modifiedAt < oldest,
  );
  for (const backup of removed) {
    rmSync(backup.path);
  }
  return removed.map(backup => backup.name);
}

/** Backs up, then prunes; prints the new file and what was removed. */
export async function backupAndPrune(label: string): Promise<string> {
  const path = await backupDatabase(label);
  process.stdout.write(`[backup] ${path}\n`);
  for (const name of pruneBackups()) {
    process.stdout.write(`[backup] removed ${name}\n`);
  }
  return path;
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  try {
    await backupAndPrune(process.argv[2] || 'manual');
  } catch (error) {
    fail(`Backup failed: ${messageOf(error)}`);
  }
}
