import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const RUNTIME_ENV_PATH = path.join(__dirname, '.runtime-env.json');

export default async function globalTeardown(): Promise<void> {
  if (!fs.existsSync(RUNTIME_ENV_PATH)) {
    return;
  }

  const runtimeEnv = JSON.parse(fs.readFileSync(RUNTIME_ENV_PATH, 'utf8')) as {
    containerId?: string;
  };

  if (runtimeEnv.containerId) {
    try {
      execSync(`docker stop ${runtimeEnv.containerId}`, { stdio: 'ignore' });
    } catch {
      // Container may already be stopped by Ryuk or a previous teardown.
    }
  }

  fs.unlinkSync(RUNTIME_ENV_PATH);
}
