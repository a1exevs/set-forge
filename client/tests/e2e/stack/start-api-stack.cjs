/**
 * Playwright webServer entry: ephemeral MySQL (Testcontainers) → migrate/seed → Nest on E2E_SERVER_PORT.
 * Stays alive until Playwright sends SIGTERM/SIGINT, then stops Nest and the container.
 */
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');

const { MySqlContainer } = require('@testcontainers/mysql');

const ports = require('./ports.json');
const E2E_CLIENT_PORT = ports.clientPort;
const E2E_SERVER_PORT = ports.serverPort;
const E2E_CLIENT_ORIGIN = `http://localhost:${E2E_CLIENT_PORT}`;

const CLIENT_ROOT = path.resolve(__dirname, '../../..');
const SERVER_ROOT = path.resolve(CLIENT_ROOT, '..', 'server');
const E2E_ENV_PATH = path.join(SERVER_ROOT, '.e2e.env');
const E2E_ENV_EXAMPLE_PATH = path.join(SERVER_ROOT, '.e2e.env.example');

const NEST_SHUTDOWN_TIMEOUT_MS = 15_000;

function assertDockerAvailable() {
  try {
    execSync('docker info', { stdio: 'ignore' });
  } catch {
    throw new Error(
      'Docker is not running. Client e2e requires Docker for Testcontainers MySQL. Start Docker and run `npm run client:test:e2e` again.',
    );
  }
}

function ensureE2eEnvFile() {
  if (!fs.existsSync(E2E_ENV_PATH)) {
    fs.copyFileSync(E2E_ENV_EXAMPLE_PATH, E2E_ENV_PATH);
  }
}

function assertPortFree(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', err => {
      reject(
        new Error(
          `Port ${port} is already in use (${err.code}). Stop the process on that port (likely a leftover Nest from a previous e2e run) and retry.`,
        ),
      );
    });
    server.once('listening', () => {
      server.close(() => resolve());
    });
    server.listen(port, '127.0.0.1');
  });
}

/** Kill `pid` and its descendants without `detached` (avoids orphan Nest after Playwright stops the webServer). */
function killProcessTree(pid, signal) {
  if (pid == null) {
    return;
  }

  let childPids = [];
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

function waitForChildExit(child, timeoutMs) {
  return new Promise(resolve => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolve(child.exitCode ?? 0);
      return;
    }

    const onExit = code => {
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

async function main() {
  assertDockerAvailable();
  ensureE2eEnvFile();
  await assertPortFree(E2E_SERVER_PORT);

  // eslint-disable-next-line no-console
  console.log('[e2e-stack] Starting MySQL 8.4 via Testcontainers…');
  const container = await new MySqlContainer('mysql:8.4').start();

  const mysqlEnv = {
    NODE_ENV: 'e2e',
    MYSQL_HOST: container.getHost(),
    MYSQL_PORT: String(container.getPort()),
    MYSQL_USER: container.getUsername(),
    MYSQL_PASSWORD: container.getUserPassword(),
    MYSQL_DB: container.getDatabase(),
  };

  // eslint-disable-next-line no-console
  console.log('[e2e-stack] Migrating and seeding e2e database…');
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

  // eslint-disable-next-line no-console
  console.log(`[e2e-stack] Starting Nest on port ${E2E_SERVER_PORT}…`);
  const nest = spawn('npx', ['nest', 'start'], {
    cwd: SERVER_ROOT,
    env: {
      ...process.env,
      ...mysqlEnv,
      PORT: String(E2E_SERVER_PORT),
      CLIENT_URL: E2E_CLIENT_ORIGIN,
    },
    stdio: 'inherit',
  });

  let shuttingDown = false;

  const shutdown = async (exitCode = 0) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;

    if (nest.exitCode === null && nest.signalCode === null && nest.pid != null) {
      killProcessTree(nest.pid, 'SIGTERM');
      await waitForChildExit(nest, NEST_SHUTDOWN_TIMEOUT_MS);
    }

    try {
      await container.stop();
    } catch {
      // Container may already be gone (Ryuk or prior stop).
    }

    process.exit(exitCode);
  };

  process.on('SIGTERM', () => {
    void shutdown(0);
  });
  process.on('SIGINT', () => {
    void shutdown(0);
  });

  nest.on('exit', code => {
    void shutdown(code ?? 1);
  });
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error('[e2e-stack] Failed to start API stack:', err);
  process.exit(1);
});
