import { execSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const RUNTIME_ENV_PATH = join(__dirname, '.runtime-env.json');

export default async function globalTeardown(): Promise<void> {
  if (!existsSync(RUNTIME_ENV_PATH)) {
    return;
  }

  const runtimeEnv = JSON.parse(readFileSync(RUNTIME_ENV_PATH, 'utf8')) as {
    containerId?: string;
  };

  if (runtimeEnv.containerId) {
    try {
      execSync(`docker stop ${runtimeEnv.containerId}`, { stdio: 'ignore' });
    } catch {
      // Container may already be stopped by Ryuk or a previous teardown.
    }
  }

  unlinkSync(RUNTIME_ENV_PATH);
}
