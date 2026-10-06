/**
 * The verification stand: the e2e stack kept running for a person or an agent to check a change by hand —
 * ephemeral MySQL → Nest → Vite, on the ports of a free slot (`stand-registry.ts`), with the data of a preset.
 *
 *   npm run client:stand -- [--preset=empty|user]     (default: user)
 *   npm run client:stand:stop                         (every stand of this checkout)
 *
 * Runs until Ctrl+C, SIGTERM or `client:stand:stop`, then stops everything and frees the slot.
 */
import { type ChildProcess } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

import { applyPreset, isStandPreset, STAND_PRESETS, type StandPreset } from './stand-presets.ts';
import {
  claimSlot,
  currentBranch,
  currentWorktree,
  recordContainer,
  releaseSlot,
  type StandEntry,
  taskOfBranch,
} from './stand-registry.ts';
import {
  type ApiStack,
  assertDockerAvailable,
  CLIENT_ROOT,
  killProcessTree,
  spawnCommand,
  startApiStack,
  waitForChildExit,
} from '../e2e/stack/api-stack.ts';

const START_TIMEOUT_MS = 300_000;
const VITE_SHUTDOWN_TIMEOUT_MS = 10_000;

function log(message: string): void {
  // eslint-disable-next-line no-console
  console.log(`[stand] ${message}`);
}

function parsePreset(args: string[]): StandPreset {
  const value = args.find(arg => arg.startsWith('--preset='))?.slice('--preset='.length) ?? 'user';
  if (!isStandPreset(value)) {
    throw new Error(`Unknown preset "${value}". Presets: ${Object.keys(STAND_PRESETS).join(', ')}.`);
  }
  return value;
}

async function waitForUrl(url: string, isFailed: () => boolean): Promise<void> {
  const deadline = Date.now() + START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (isFailed()) {
      throw new Error(`A stand process exited before ${url} answered.`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Not listening yet.
    }
    await sleep(1_000);
  }
  throw new Error(`${url} did not answer within ${START_TIMEOUT_MS / 1000} s.`);
}

function hasExited(child: ChildProcess | null): boolean {
  return child !== null && (child.exitCode !== null || child.signalCode !== null);
}

async function main(): Promise<void> {
  const preset = parsePreset(process.argv.slice(2));
  assertDockerAvailable('run `npm run client:stand` again');

  const branch = currentBranch(CLIENT_ROOT);
  const entry: StandEntry = await claimSlot(CLIENT_ROOT, {
    pid: process.pid,
    branch,
    task: taskOfBranch(branch),
    worktree: currentWorktree(CLIENT_ROOT),
    preset,
    startedAt: new Date().toISOString(),
  });

  const serverOrigin = `http://localhost:${entry.serverPort}`;
  const clientOrigin = `http://localhost:${entry.clientPort}`;
  log(`Slot ${entry.slot}: API ${serverOrigin}, client ${clientOrigin}, preset "${preset}".`);

  let stack: ApiStack | null = null;
  let vite: ChildProcess | null = null;
  let shuttingDown = false;

  const shutdown = async (exitCode: number): Promise<void> => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    log('Stopping…');
    if (vite && !hasExited(vite) && vite.pid != null) {
      killProcessTree(vite.pid, 'SIGTERM');
      await waitForChildExit(vite, VITE_SHUTDOWN_TIMEOUT_MS);
    }
    await stack?.stop();
    await releaseSlot(CLIENT_ROOT, entry.slot);
    log(`Slot ${entry.slot} is free.`);
    process.exit(exitCode);
  };

  process.on('SIGTERM', () => {
    void shutdown(0);
  });
  process.on('SIGINT', () => {
    void shutdown(0);
  });

  try {
    stack = await startApiStack({ serverPort: entry.serverPort, clientOrigin, log });
    await recordContainer(CLIENT_ROOT, entry.slot, stack.containerId);
    stack.nest.on('exit', code => {
      void shutdown(code ?? 1);
    });

    log(`Starting Vite on port ${entry.clientPort}…`);
    vite = spawnCommand('npm', ['run', 'dev', '--', '--strictPort'], {
      cwd: CLIENT_ROOT,
      env: {
        ...process.env,
        VITE_DEV_SERVER_PORT: String(entry.clientPort),
        VITE_DEV_API_PROXY: serverOrigin,
      },
      stdio: 'inherit',
    });
    vite.on('exit', code => {
      void shutdown(code ?? 1);
    });

    const failed = (): boolean => hasExited(stack?.nest ?? null) || hasExited(vite);
    await waitForUrl(`${serverOrigin}/api/1.0/health`, failed);
    await waitForUrl(clientOrigin, failed);

    const notes = await applyPreset(preset, serverOrigin);
    log(`Ready: ${clientOrigin} (API ${serverOrigin}, slot ${entry.slot}, preset "${preset}").`);
    for (const note of notes) {
      log(note);
    }
    log('Stop with Ctrl+C or `npm run client:stand:stop`.');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[stand] Failed to start:', err);
    await shutdown(1);
  }
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error('[stand] Failed to start:', err);
  process.exit(1);
});
