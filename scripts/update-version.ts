// Version branch workflow: resets common/version-increase onto origin/develop, bumps the version
// (npm run version:<type>), commits it and force-pushes the branch.
//
//   npm run update-version:<patch|minor|major>

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const VERSION_TYPES = ['patch', 'minor', 'major'] as const;
type VersionType = (typeof VERSION_TYPES)[number];

const BRANCH = 'common/version-increase';
const ROOT = join(import.meta.dirname, '..');
const CLIENT_PACKAGE_JSON = join(ROOT, 'client', 'package.json');

const isVersionType = (value: string | undefined): value is VersionType => VERSION_TYPES.some(type => type === value);

/** Runs a command with the output shown; a non-zero exit throws. */
function run(command: string, args: string[]): void {
  execFileSync(command, args, { cwd: ROOT, stdio: 'inherit' });
}

/** Exit status of a command whose output is not needed. */
function succeeds(command: string, args: string[]): boolean {
  try {
    execFileSync(command, args, { cwd: ROOT, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const readVersion = (): string =>
  (JSON.parse(readFileSync(CLIENT_PACKAGE_JSON, 'utf8')) as { version: string }).version;

function main(): void {
  const versionType = process.argv[2];
  if (!versionType) {
    process.stderr.write('Need to set version type: patch, minor, or major\n');
    process.exit(1);
  }
  if (!isVersionType(versionType)) {
    process.stderr.write(`Incorrect parameter: ${versionType}. Please use patch, minor, or major.\n`);
    process.exit(1);
  }

  if (!succeeds('git', ['diff', '--quiet']) || !succeeds('git', ['diff', '--cached', '--quiet'])) {
    process.stderr.write('Working tree is not clean. Commit or stash changes before running this script.\n');
    process.exit(1);
  }

  run('git', ['fetch', 'origin', 'develop', BRANCH]);

  if (!succeeds('git', ['checkout', BRANCH])) {
    run('git', ['checkout', '-b', BRANCH, `origin/${BRANCH}`]);
  }

  // Align with latest develop instead of merging. After a version PR lands on develop,
  // both branches touch the same version files and merge often conflicts.
  run('git', ['reset', '--hard', 'origin/develop']);

  process.stdout.write(`Previous version: ${readVersion()}\n`);

  // npm is npm.cmd on Windows, which only a shell can start; the arguments hold no spaces to quote.
  execFileSync('npm', ['run', `version:${versionType}`], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  const newVersion = readVersion();
  process.stdout.write(`New version: ${newVersion}\n`);

  run('git', ['add', 'client/package.json', 'client/public/manifest.json', 'server/package.json']);

  run('git', ['commit', '-m', `[Common] Version increase v${newVersion}`]);

  run('git', ['push', '--force-with-lease', 'origin', BRANCH]);
}

try {
  main();
} catch {
  // The failed command has already printed its error (stdio: 'inherit').
  process.exit(1);
}
