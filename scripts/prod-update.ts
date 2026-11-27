// Updates the production stack of this checkout to a release tag: the new images are built while the running
// release serves, the database is backed up and migrated before the switch, and the switch is checked by health.
//
//   npm run prod:update -- v1.2.3       # exit 2 without a version or with an unknown one, 1 when a step fails
//
// A failure before the switch puts the checkout back and leaves the running release untouched; a failure after
// it prints the rollback. Migrations keep the previous release working: .claude/rules/database-migrations.md.

import { backupAndPrune } from './prod-backup.ts';
import { capture, compose, fail, isRunning, messageOf, run, succeeds } from './prod-compose.ts';

const WAIT_TIMEOUT_SECONDS = '180';
const HEALTH_URL = 'http://127.0.0.1/api/1.0/health';
const STEPS = 8;
// The release the stack runs, kept as a git ref: it survives checkouts and never shows as a local change.
const DEPLOYED_REF = 'refs/set-forge/deployed';

/** Prints the step being started. */
function step(index: number, title: string): void {
  process.stdout.write(`\n[update] ${index}/${STEPS} ${title}\n`);
}

/** The newest release tag, or null when there is none. */
function latestTag(): string | null {
  return capture('git', ['tag', '--list', 'v*', '--sort=-v:refname']).split(/\r?\n/)[0] || null;
}

/** The release tag of a commit, or null when it has none. */
function tagOf(ref: string): string | null {
  const args = ['describe', '--tags', '--exact-match', ref];
  return succeeds('git', args) ? capture('git', args) : null;
}

/** The release the stack runs: recorded by the last update, else the checkout's tag unless that is the target. */
function runningRelease(target: string): string | null {
  const recorded = succeeds('git', ['rev-parse', '--verify', '--quiet', DEPLOYED_REF]) ? tagOf(DEPLOYED_REF) : null;
  const head = tagOf('HEAD');
  return recorded ?? (head === target ? null : head);
}

/** What `git checkout` takes to come back here: the branch when on one, else the commit. */
function headRef(): string {
  return succeeds('git', ['symbolic-ref', '-q', 'HEAD'])
    ? capture('git', ['symbolic-ref', '--short', 'HEAD'])
    : capture('git', ['rev-parse', 'HEAD']);
}

const version = process.argv[2];

step(1, 'Checking the checkout');
try {
  run('git', ['fetch', '--tags', '--quiet', 'origin']);
} catch (error) {
  fail(`Cannot fetch the release tags: ${messageOf(error)}\nNothing was changed.`);
}
if (!version) {
  fail(`Usage: npm run prod:update -- <version>. The latest release: ${latestTag() ?? 'none'}.`, 2);
}
if (!succeeds('git', ['rev-parse', '--verify', '--quiet', `refs/tags/${version}^{commit}`])) {
  fail(`No release tag ${version}. The latest release: ${latestTag() ?? 'none'}.`, 2);
}
const changes = capture('git', ['status', '--porcelain']);
if (changes) {
  fail(
    `The checkout has local changes — commit, stash or remove them first; nothing was changed:\n${changes}\n` +
      'An update replaces the working tree with the release, so local edits would be lost or block it.',
  );
}
if (!isRunning('mysql')) {
  fail('The stack is not running — this is an update, not a first deploy (DEPLOY-SELECTEL.md). Nothing was changed.');
}

const checkoutRef = headRef();
const checkout = tagOf('HEAD') ?? checkoutRef;
const running = runningRelease(version);
const previous = running ?? 'the release that ran before';
process.stdout.write(`[update] ${previous} → ${version}\n`);

/** Puts the checkout back where it was and ends the update; the running containers were not touched. */
function abortBeforeSwitch(title: string, error: unknown, backup: string | null): never {
  run('git', ['checkout', '--quiet', checkoutRef]);
  fail(
    `Step "${title}" failed: ${messageOf(error)}\n` +
      `The site still serves ${previous}; the checkout is back on ${checkout}.\n` +
      (backup
        ? `Backup taken before the step: ${backup}\n` +
          'A migration that failed half-way may have left part of its changes: check `npm run prod:db:migrate:status`, ' +
          'and restore the backup if the schema is broken (DEPLOY-SELECTEL.md, "Restore from a backup").'
        : ''),
  );
}

let backup: string | null = null;
let title = 'Checking out the release';
try {
  step(2, `${title} ${version}`);
  run('git', ['checkout', '--quiet', '--detach', `refs/tags/${version}`]);

  title = 'Building the images (the running release keeps serving)';
  step(3, title);
  compose(['build']);

  title = 'Backing up the database';
  step(4, title);
  backup = await backupAndPrune(`before-${version}`);

  title = 'Applying the migrations with the new image';
  step(5, title);
  compose(['run', '--rm', '--no-deps', 'server-prod', 'npx', 'sequelize-cli', 'db:migrate']);
} catch (error) {
  abortBeforeSwitch(title, error, backup);
}

const rollback =
  `Rollback: npm run prod:update -- ${running ?? '<the release that ran before>'}\n` +
  `If ${previous} cannot run on the schema of ${version}, restore the backup ${backup} ` +
  '(DEPLOY-SELECTEL.md, "Restore from a backup").';

try {
  title = 'Switching to the new release';
  step(6, title);
  compose(['up', '-d', '--wait', '--wait-timeout', WAIT_TIMEOUT_SECONDS]);

  title = 'Checking the health of the API through nginx';
  step(7, title);
  compose(['exec', '-T', 'client-prod', 'wget', '-q', '-O', '-', HEALTH_URL]);
  run('git', ['update-ref', DEPLOYED_REF, `refs/tags/${version}^{commit}`]);
} catch (error) {
  fail(`Step "${title}" failed: ${messageOf(error)}\nThe stack runs ${version} and is not healthy.\n${rollback}`);
}

step(8, 'Removing the unused images');
try {
  run('docker', ['image', 'prune', '--force']);
} catch (error) {
  process.stderr.write(`[update] could not remove the unused images: ${messageOf(error)}\n`);
}

process.stdout.write(`\n[update] Done: the site serves ${version} (was ${previous}). Backup: ${backup}\n${rollback}\n`);
