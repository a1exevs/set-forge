/**
 * Stops running stands and frees their slots.
 *
 *   npm run client:stand:stop                 every stand started from this checkout
 *   npm run client:stand:stop -- --slot=<k>   the stand in slot k
 *   npm run client:stand:stop -- --list       print the running stands
 *
 * The stand stops itself — Nest, Vite and MySQL through its own handles, like on Ctrl+C: macOS / Linux get a
 * SIGTERM, Windows has no signal to send a process, so the stand polls for a stop file in `.runtime/` (see
 * `stopRequestPath`). A stand that does not exit in time is killed with its process tree, and whatever a kill may
 * miss — a listener on the stand's ports, its container — is removed afterwards from the registry's record.
 */
import { rmSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

import {
  currentWorktree,
  findStand,
  isProcessAlive,
  isStandProcess,
  listStands,
  releaseSlot,
  removeLeftovers,
  requestStop,
  STAND_START_TIMEOUT_MS,
  type StandEntry,
  stopRequestPath,
} from './stand-registry.ts';
import { CLIENT_ROOT, killProcessTree } from '../e2e/stack/api-stack.ts';

const GRACEFUL_STOP_TIMEOUT_MS = 30_000;
const KILL_TIMEOUT_MS = 10_000;

function log(message: string): void {
  // eslint-disable-next-line no-console
  console.log(`[stand] ${message}`);
}

function describe(entry: StandEntry, running: boolean): string {
  const pid = running ? `pid ${entry.pid}` : `pid ${entry.pid} (gone, leftovers to remove)`;
  return `slot ${entry.slot} · client http://localhost:${entry.clientPort} · API http://localhost:${entry.serverPort} · ${entry.branch} · ${entry.worktree} · preset "${entry.preset}" · ${pid}`;
}

async function waitForExit(pid: number, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!isProcessAlive(pid)) {
      return true;
    }
    await sleep(500);
  }
  return !isProcessAlive(pid);
}

function askToStop(entry: StandEntry): void {
  if (process.platform === 'win32') {
    requestStop(CLIENT_ROOT, entry.slot);
    return;
  }
  try {
    process.kill(entry.pid, 'SIGTERM');
  } catch {
    // Exited between the listing and now.
  }
}

/**
 * A stand asked to stop while it starts finishes the start first, and until its MySQL runs there is no container id
 * in the registry to fall back on — so the grace period begins once the container is recorded, or the stand is gone.
 */
async function waitForContainer(entry: StandEntry): Promise<void> {
  if (entry.containerId) {
    return;
  }
  log(`Slot ${entry.slot} is still starting, waiting for its container…`);
  const deadline = Date.now() + STAND_START_TIMEOUT_MS;
  while (Date.now() < deadline && isProcessAlive(entry.pid)) {
    if (findStand(CLIENT_ROOT, entry.slot)?.containerId !== null) {
      return;
    }
    await sleep(500);
  }
}

async function stop(entry: StandEntry): Promise<void> {
  // A pid that no longer runs a stand (dead, or reused by another process) is only a record of leftovers.
  const running = isStandProcess(entry.pid);
  log(`Stopping ${describe(entry, running)}`);
  if (running) {
    askToStop(entry);
    await waitForContainer(entry);
    if (!(await waitForExit(entry.pid, GRACEFUL_STOP_TIMEOUT_MS))) {
      log(`Slot ${entry.slot} did not stop in ${GRACEFUL_STOP_TIMEOUT_MS / 1000} s, killing its process tree…`);
      killProcessTree(entry.pid, 'SIGKILL');
      if (!(await waitForExit(entry.pid, KILL_TIMEOUT_MS))) {
        throw new Error(`The stand process ${entry.pid} of slot ${entry.slot} survived the kill.`);
      }
    }
  }
  // The stand removes the request when it takes it; a stand that was killed instead leaves it.
  rmSync(stopRequestPath(CLIENT_ROOT, entry.slot), { force: true });
  // The record may have gained the container id since the listing (a stand stopped during its start).
  removeLeftovers(findStand(CLIENT_ROOT, entry.slot) ?? entry);
  // A graceful stop frees the slot itself; after a kill the entry is still there.
  await releaseSlot(CLIENT_ROOT, entry.slot);
  log(`Slot ${entry.slot} is free.`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const stands = listStands(CLIENT_ROOT);

  if (args.includes('--list')) {
    if (stands.length === 0) {
      log('No stands are running.');
    }
    for (const entry of stands) {
      log(describe(entry, isStandProcess(entry.pid)));
    }
    return;
  }

  const slotArg = args.find(arg => arg.startsWith('--slot='))?.slice('--slot='.length);
  const worktree = currentWorktree(CLIENT_ROOT);
  const targets = slotArg
    ? stands.filter(entry => entry.slot === Number(slotArg))
    : stands.filter(entry => entry.worktree === worktree);

  if (targets.length === 0) {
    log(slotArg ? `No stand runs in slot ${slotArg}.` : `No stand runs from ${worktree}.`);
    for (const entry of stands) {
      log(`running: ${describe(entry, isStandProcess(entry.pid))}`);
    }
    return;
  }

  for (const entry of targets) {
    await stop(entry);
  }
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error('[stand] Failed to stop:', err);
  process.exit(1);
});
