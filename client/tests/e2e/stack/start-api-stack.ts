/**
 * Playwright webServer entry: ephemeral MySQL (Testcontainers) → migrate/seed → Nest on E2E_SERVER_PORT.
 * Stays alive until Playwright sends SIGTERM/SIGINT, then stops Nest and the container.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { assertDockerAvailable, assertPortFree, startApiStack } from './api-stack.ts';

// Plain Node runs this file, so it reads ports.json itself instead of the `tests/...` alias of ports.ts.
const ports = JSON.parse(readFileSync(join(import.meta.dirname, 'ports.json'), 'utf8')) as {
  clientPort: number;
  serverPort: number;
};

const E2E_CLIENT_ORIGIN = `http://localhost:${ports.clientPort}`;

function log(message: string): void {
  // eslint-disable-next-line no-console
  console.log(`[e2e-stack] ${message}`);
}

async function main(): Promise<void> {
  assertDockerAvailable('run `npm run client:test:e2e` again');
  await assertPortFree(
    ports.serverPort,
    'Stop the process on that port (likely a leftover Nest from a previous e2e run) and retry.',
  );

  const stack = await startApiStack({ serverPort: ports.serverPort, clientOrigin: E2E_CLIENT_ORIGIN, log });

  const shutdown = async (exitCode: number): Promise<void> => {
    await stack.stop();
    process.exit(exitCode);
  };

  process.on('SIGTERM', () => {
    void shutdown(0);
  });
  process.on('SIGINT', () => {
    void shutdown(0);
  });

  stack.nest.on('exit', code => {
    void shutdown(code ?? 1);
  });
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error('[e2e-stack] Failed to start API stack:', err);
  process.exit(1);
});
