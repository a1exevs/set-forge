/**
 * Which stand runs on which ports, shared by every checkout of the repository: the registry lives in `.runtime/` of
 * the main checkout, so stands started from different worktrees never take the same slot.
 */
import { execSync } from 'node:child_process';
import { closeSync, mkdirSync, openSync, readFileSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import { isPortFree, killListeners } from '../e2e/stack/api-stack.ts';

/** Slot k serves the API on 5300 + k and the client on 5400 + k — clear of dev (5000 / 5173) and e2e (5101 / 5174). */
const SERVER_PORT_BASE = 5300;
const CLIENT_PORT_BASE = 5400;
const SLOT_COUNT = 10;

const LOCK_STALE_MS = 10_000;
const LOCK_TIMEOUT_MS = 15_000;

/** How long a stand may take to come up (an image pull, the API build) — `client:stand:stop` waits as long for one. */
export const STAND_START_TIMEOUT_MS = 300_000;

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

function warn(message: string): void {
  // eslint-disable-next-line no-console
  console.warn(`[stand] ${message}`);
}

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

function commandLineOf(pid: number): string {
  const command =
    process.platform === 'win32'
      ? `powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter 'ProcessId=${pid}').CommandLine"`
      : `ps -o args= -p ${pid}`;
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
}

/**
 * The pid runs a stand. A pid alone proves nothing: after a reboot or enough process churn the pid of a dead stand
 * belongs to something else, and that something must not be asked to stop, waited for or killed.
 */
export function isStandProcess(pid: number): boolean {
  return isProcessAlive(pid) && commandLineOf(pid).includes('start-stand');
}

function registryPaths(cwd: string): { dir: string; file: string; lock: string } {
  const dir = join(mainCheckout(cwd), '.runtime');
  return { dir, file: join(dir, 'stands.json'), lock: join(dir, 'stands.lock') };
}

/**
 * The stop request of a slot: `client:stand:stop` creates the file, the stand polls for it and stops itself the way
 * it does on SIGTERM. Windows has no signal to send a process, and a kill from outside would leave Nest, Vite and
 * the container to the fallback below.
 */
export function stopRequestPath(cwd: string, slot: number): string {
  return join(registryPaths(cwd).dir, `stand-${slot}.stop`);
}

export function requestStop(cwd: string, slot: number): void {
  const { dir } = registryPaths(cwd);
  mkdirSync(dir, { recursive: true });
  writeFileSync(stopRequestPath(cwd, slot), `${new Date().toISOString()}\n`);
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
 * Removes what a killed stand leaves: whatever still listens on its ports (a Nest or Vite the kill of the process
 * tree missed), its MySQL container — Testcontainers' reaper is shared by every stand on the machine and keeps it
 * while any other stand runs — and its API build in `server/.stack/<port>` of its checkout. After a graceful stop
 * all of it is already gone.
 */
export function removeLeftovers(entry: StandEntry): void {
  const killed = killListeners([entry.serverPort, entry.clientPort]);
  if (killed.length > 0) {
    warn(`Slot ${entry.slot}: killed pid ${killed.join(', ')} still listening on its ports.`);
  }
  if (entry.containerId) {
    try {
      execSync(`docker rm -f ${entry.containerId}`, { stdio: ['ignore', 'ignore', 'pipe'] });
    } catch (err) {
      const stderr = String((err as { stderr?: Buffer | string }).stderr ?? err).trim();
      if (!stderr.includes('No such container')) {
        warn(`Slot ${entry.slot}: \`docker rm -f ${entry.containerId.slice(0, 12)}\` failed: ${stderr}`);
      }
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
    const live = registry.stands.filter(entry => isStandProcess(entry.pid));
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

/** Every registered stand, running or not: an entry outlives a killed stand until its leftovers are removed. */
export function listStands(cwd: string): StandEntry[] {
  return readRegistry(registryPaths(cwd).file).stands;
}

/** The current record of a slot — it gains the container id while the stand starts. */
export function findStand(cwd: string, slot: number): StandEntry | null {
  return listStands(cwd).find(entry => entry.slot === slot) ?? null;
}
