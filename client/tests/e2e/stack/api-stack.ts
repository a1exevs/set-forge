/**
 * The API half of a full-stack run, shared by the Playwright e2e (`start-api-stack.ts`) and the verification stand
 * (`tests/stand/start-stand.ts`): ephemeral MySQL (Testcontainers) → migrate/seed → Nest on a given port.
 */
import { MySqlContainer } from '@testcontainers/mysql';
import { type ChildProcess, execSync, spawn, type SpawnOptions } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { connect, createServer } from 'node:net';
import { join, resolve as resolvePath } from 'node:path';

export const CLIENT_ROOT = resolvePath(import.meta.dirname, '../../..');
export const SERVER_ROOT = resolvePath(CLIENT_ROOT, '..', 'server');

const E2E_ENV_PATH = join(SERVER_ROOT, '.e2e.env');
const E2E_ENV_EXAMPLE_PATH = join(SERVER_ROOT, '.e2e.env.example');

const NEST_SHUTDOWN_TIMEOUT_MS = 15_000;
const IS_WINDOWS = process.platform === 'win32';

export type ApiStack = {
  nest: ChildProcess;
  /** The MySQL container — `docker rm -f <id>` removes it when the stack was killed without `stop()`. */
  containerId: string;
  /** Stops Nest, then the container. Safe to call more than once. */
  stop: () => Promise<void>;
};

type StartApiStackOptions = {
  serverPort: number;
  /** The client origin Nest allows in CORS (`CLIENT_URL`). */
  clientOrigin: string;
  log: (message: string) => void;
};

export function assertDockerAvailable(retryHint: string): void {
  try {
    execSync('docker info', { stdio: 'ignore' });
  } catch {
    throw new Error(`Docker is not running. Testcontainers MySQL needs it. Start Docker and ${retryHint}.`);
  }
}

function listenOnce(port: number, host?: string): Promise<NodeJS.ErrnoException | null> {
  return new Promise(resolve => {
    const server = createServer();
    server.once('error', (err: NodeJS.ErrnoException) => resolve(err));
    server.once('listening', () => {
      server.close(() => resolve(null));
    });
    server.listen(port, host);
  });
}

function answers(port: number, host: string): Promise<boolean> {
  return new Promise(resolve => {
    const socket = connect({ port, host });
    socket.setTimeout(1_000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
  });
}

/**
 * Nobody listens on the port. A bind alone is not proof: on Windows `127.0.0.1:<port>` binds even while Nest holds
 * `0.0.0.0` / `[::]`, so the loopback addresses are probed with a connection first, then the port is bound on all
 * addresses the way Nest and Vite bind it.
 */
export async function isPortFree(port: number): Promise<boolean> {
  for (const host of ['127.0.0.1', '::1']) {
    if (await answers(port, host)) {
      return false;
    }
  }
  return (await listenOnce(port)) === null;
}

export async function assertPortFree(port: number, hint: string): Promise<void> {
  if (!(await isPortFree(port))) {
    throw new Error(`Port ${port} is already in use. ${hint}`);
  }
}

/** `spawn` that also finds `npm` / `npx` on Windows, where they are `.cmd` files and need a shell. */
export function spawnCommand(command: string, args: string[], options: SpawnOptions): ChildProcess {
  return spawn(command, args, { ...options, shell: IS_WINDOWS });
}

/** Kill `pid` and its descendants (avoids an orphan Nest or Vite after the parent stops). */
export function killProcessTree(pid: number | undefined, signal: NodeJS.Signals): void {
  if (pid == null) {
    return;
  }

  if (IS_WINDOWS) {
    // Windows has no signals to forward: /T takes the whole tree, /F does not wait for it.
    try {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
    } catch {
      // Already exited.
    }
    return;
  }

  let childPids: number[] = [];
  try {
    childPids = execSync(`pgrep -P ${pid}`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .map(line => Number(line))
      .filter(Boolean);
  } catch {
    // No children.
  }

  for (const childPid of childPids) {
    killProcessTree(childPid, signal);
  }

  try {
    process.kill(pid, signal);
  } catch {
    // Already exited.
  }
}

export function waitForChildExit(child: ChildProcess, timeoutMs: number): Promise<number> {
  return new Promise(resolve => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolve(child.exitCode ?? 0);
      return;
    }

    const onExit = (code: number | null): void => {
      clearTimeout(timer);
      resolve(code ?? 0);
    };

    const timer = setTimeout(() => {
      child.off('exit', onExit);
      if (child.pid != null) {
        killProcessTree(child.pid, 'SIGKILL');
      }
      resolve(child.exitCode ?? 1);
    }, timeoutMs);

    child.once('exit', onExit);
  });
}

function ensureE2eEnvFile(): void {
  if (!existsSync(E2E_ENV_PATH)) {
    copyFileSync(E2E_ENV_EXAMPLE_PATH, E2E_ENV_PATH);
  }
}

/**
 * A tsconfig that builds the API into `server/.stack/<port>/dist` instead of `server/dist`. `nest start` empties its
 * output first, so a shared `dist` would let one stack wipe the build of another — or of a running
 * `server:start:dev` in the same checkout.
 */
function writeBuildConfig(serverPort: number): { buildDir: string; tsconfigPath: string } {
  const buildDir = join(SERVER_ROOT, '.stack', String(serverPort));
  mkdirSync(buildDir, { recursive: true });
  const tsconfig = {
    extends: '../../tsconfig.build.json',
    compilerOptions: { outDir: './dist', incremental: false },
    // Without it the defaults would look for sources next to this file.
    include: ['../../src/**/*'],
  };
  writeFileSync(join(buildDir, 'tsconfig.json'), `${JSON.stringify(tsconfig, null, 2)}\n`);
  return { buildDir, tsconfigPath: `.stack/${serverPort}/tsconfig.json` };
}

export async function startApiStack({ serverPort, clientOrigin, log }: StartApiStackOptions): Promise<ApiStack> {
  ensureE2eEnvFile();
  const { buildDir, tsconfigPath } = writeBuildConfig(serverPort);

  log('Starting MySQL 8.4 via Testcontainers…');
  const container = await new MySqlContainer('mysql:8.4').start();

  const mysqlEnv = {
    NODE_ENV: 'e2e',
    MYSQL_HOST: container.getHost(),
    MYSQL_PORT: String(container.getPort()),
    MYSQL_USER: container.getUsername(),
    MYSQL_PASSWORD: container.getUserPassword(),
    MYSQL_DB: container.getDatabase(),
  };

  log('Migrating and seeding the database…');
  execSync('npx sequelize-cli db:migrate --env e2e', {
    cwd: SERVER_ROOT,
    env: { ...process.env, ...mysqlEnv },
    stdio: 'inherit',
  });
  execSync('npx sequelize-cli db:seed:all --env e2e', {
    cwd: SERVER_ROOT,
    env: { ...process.env, ...mysqlEnv },
    stdio: 'inherit',
  });

  log(`Starting Nest on port ${serverPort}…`);
  const nest = spawnCommand('npx', ['nest', 'start', '--path', tsconfigPath], {
    cwd: SERVER_ROOT,
    env: {
      ...process.env,
      ...mysqlEnv,
      PORT: String(serverPort),
      CLIENT_URL: clientOrigin,
    },
    stdio: 'inherit',
  });

  let stopped = false;
  const stop = async (): Promise<void> => {
    if (stopped) {
      return;
    }
    stopped = true;

    if (nest.exitCode === null && nest.signalCode === null && nest.pid != null) {
      killProcessTree(nest.pid, 'SIGTERM');
      await waitForChildExit(nest, NEST_SHUTDOWN_TIMEOUT_MS);
    }

    try {
      await container.stop();
    } catch {
      // Container may already be gone (Ryuk or prior stop).
    }

    rmSync(buildDir, { recursive: true, force: true });
  };

  return { nest, containerId: container.getId(), stop };
}
