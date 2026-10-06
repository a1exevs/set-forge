/**
 * Which stand runs on which ports, shared by every checkout of the repository: the registry lives in `.runtime/` of
 * the main checkout, so stands started from different worktrees never take the same slot.
 */
import { execSync } from 'node:child_process';
import { closeSync, mkdirSync, openSync, readFileSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import { isPortFree } from '../e2e/stack/api-stack.ts';

/** Slot k serves the API on 5300 + k and the client on 5400 + k — clear of dev (5000 / 5173) and e2e (5101 / 5174). */
const SERVER_PORT_BASE = 5300;
const CLIENT_PORT_BASE = 5400;
const SLOT_COUNT = 10;

const LOCK_STALE_MS = 10_000;
const LOCK_TIMEOUT_MS = 15_000;

export type StandEntry = {
  slot: number;
  serverPort: number;
  clientPort: number;
  /** The stand process; a dead pid marks an abandoned entry. */
  pid: number;
  branch: string;
  /** The issue number of a task branch (`/branches` §2), or null. */
  task: string | null;
  worktree: string;
  preset: string;
  /** Its MySQL container, once started — removed by `client:stand:stop` when the stand was killed. */
  containerId: string | null;
  startedAt: string;
};

type Registry = { stands: StandEntry[] };

function git(args: string, cwd: string): string {
  return execSync(`git ${args}`, { cwd, encoding: 'utf8' }).trim();
}

/** The checkout this process runs in (a worktree or the main one). */
export function currentWorktree(cwd: string): string {
  return git('rev-parse --show-toplevel', cwd);
}

export function currentBranch(cwd: string): string {
  return git('rev-parse --abbrev-ref HEAD', cwd);
}

/** The main checkout: the first entry of `git worktree list`. */
function mainCheckout(cwd: string): string {
  const firstLine = git('worktree list --porcelain', cwd).split('\n')[0] ?? '';
  return firstLine.replace(/^worktree /, '');
}

export function taskOfBranch(branch: string): string | null {
  return /^[^/]+\/(\d+)-/.exec(branch)?.[1] ?? null;
}

export function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    // EPERM: the process exists but belongs to someone else.
    return (err as NodeJS.ErrnoException).code === 'EPERM';
  }
}

function registryPaths(cwd: string): { dir: string; file: string; lock: string } {
  const dir = join(mainCheckout(cwd), '.runtime');
  return { dir, file: join(dir, 'stands.json'), lock: join(dir, 'stands.lock') };
}

function readRegistry(file: string): Registry {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as Registry;
  } catch {
    return { stands: [] };
  }
}

function writeRegistry(file: string, registry: Registry): void {
  writeFileSync(file, `${JSON.stringify(registry, null, 2)}\n`);
}

async function withLock<T>(cwd: string, action: (file: string) => Promise<T>): Promise<T> {
  const { dir, file, lock } = registryPaths(cwd);
  mkdirSync(dir, { recursive: true });

  const deadline = Date.now() + LOCK_TIMEOUT_MS;
  for (;;) {
    try {
      closeSync(openSync(lock, 'wx'));
      break;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw err;
      }
      // A lock older than any registry update is left by a killed process.
      try {
        if (Date.now() - statSync(lock).mtimeMs > LOCK_STALE_MS) {
          unlinkSync(lock);
          continue;
        }
      } catch {
        continue;
      }
      if (Date.now() > deadline) {
        throw new Error(`The stand registry is locked (${lock}). Delete the file if no stand is starting.`);
      }
      await sleep(100);
    }
  }

  try {
    return await action(file);
  } finally {
    unlinkSync(lock);
  }
}

/**
 * Removes what a killed stand leaves: its MySQL container — Testcontainers' reaper is shared by every stand on the
 * machine and keeps it while any other stand runs — and its API build in `server/.stack/<port>` of its checkout.
 * After a graceful stop both are already gone.
 */
export function removeLeftovers(entry: StandEntry): void {
  if (entry.containerId) {
    try {
      execSync(`docker rm -f ${entry.containerId}`, { stdio: 'ignore' });
    } catch {
      // Already gone.
    }
  }
  rmSync(join(entry.worktree, 'server', '.stack', String(entry.serverPort)), { recursive: true, force: true });
}

/** Takes the first slot whose owner is gone and whose ports are free, and records the new stand in it. */
export function claimSlot(
  cwd: string,
  stand: Omit<StandEntry, 'slot' | 'serverPort' | 'clientPort' | 'containerId'>,
): Promise<StandEntry> {
  return withLock(cwd, async file => {
    const registry = readRegistry(file);
    const live = registry.stands.filter(entry => isProcessAlive(entry.pid));
    // A stand that died without `client:stand:stop` left its container: the registry is the last place that knows it.
    for (const dead of registry.stands.filter(entry => !live.includes(entry))) {
      removeLeftovers(dead);
    }

    for (let slot = 0; slot < SLOT_COUNT; slot++) {
      if (live.some(entry => entry.slot === slot)) {
        continue;
      }
      const serverPort = SERVER_PORT_BASE + slot;
      const clientPort = CLIENT_PORT_BASE + slot;
      // A port held by something outside the registry (an orphan Nest after a hard kill) skips the slot.
      if (!(await isPortFree(serverPort)) || !(await isPortFree(clientPort))) {
        continue;
      }
      const entry: StandEntry = { slot, serverPort, clientPort, containerId: null, ...stand };
      writeRegistry(file, { stands: [...live, entry] });
      return entry;
    }

    throw new Error(
      `All ${SLOT_COUNT} stand slots are busy: ${file}. Stop a stand with \`npm run client:stand:stop\`.`,
    );
  });
}

export function recordContainer(cwd: string, slot: number, containerId: string): Promise<void> {
  return withLock(cwd, async file => {
    const registry = readRegistry(file);
    writeRegistry(file, {
      stands: registry.stands.map(entry => (entry.slot === slot ? { ...entry, containerId } : entry)),
    });
  });
}

export function releaseSlot(cwd: string, slot: number): Promise<void> {
  return withLock(cwd, async file => {
    const registry = readRegistry(file);
    writeRegistry(file, { stands: registry.stands.filter(entry => entry.slot !== slot) });
  });
}

export function listStands(cwd: string): StandEntry[] {
  return readRegistry(registryPaths(cwd).file).stands.filter(entry => isProcessAlive(entry.pid));
}
