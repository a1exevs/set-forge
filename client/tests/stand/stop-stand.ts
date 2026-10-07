/**
 * Stops running stands and frees their slots.
 *
 *   npm run client:stand:stop                 every stand started from this checkout
 *   npm run client:stand:stop -- --slot=<k>   the stand in slot k
 *   npm run client:stand:stop -- --list       print the running stands
 *
 * macOS / Linux: SIGTERM lets the stand stop Nest, Vite and MySQL itself. Windows has no signals to send, so the
 * process tree is killed and the container removed by its id from the registry.
 */
import { setTimeout as sleep } from 'node:timers/promises';

import {
  currentWorktree,
  isProcessAlive,
  listStands,
  releaseSlot,
  removeLeftovers,
  type StandEntry,
} from './stand-registry.ts';
import { CLIENT_ROOT, killProcessTree } from '../e2e/stack/api-stack.ts';

const GRACEFUL_STOP_TIMEOUT_MS = 30_000;

function log(message: string): void {
  // eslint-disable-next-line no-console
  console.log(`[stand] ${message}`);
}

function describe(entry: StandEntry): string {
  return `slot ${entry.slot} · client http://localhost:${entry.clientPort} · API http://localhost:${entry.serverPort} · ${entry.branch} · ${entry.worktree} · preset "${entry.preset}" · pid ${entry.pid}`;
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

async function stop(entry: StandEntry): Promise<void> {
  log(`Stopping ${describe(entry)}`);
  if (process.platform === 'win32') {
    killProcessTree(entry.pid, 'SIGKILL');
  } else {
    process.kill(entry.pid, 'SIGTERM');
    if (!(await waitForExit(entry.pid, GRACEFUL_STOP_TIMEOUT_MS))) {
      killProcessTree(entry.pid, 'SIGKILL');
    }
  }
  await waitForExit(entry.pid, GRACEFUL_STOP_TIMEOUT_MS);
  removeLeftovers(entry);
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
      log(describe(entry));
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
      log(`running: ${describe(entry)}`);
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
