import { MySqlContainer } from '@testcontainers/mysql';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const SERVER_ROOT = path.resolve(__dirname, '../..');
const RUNTIME_ENV_PATH = path.join(__dirname, '.runtime-env.json');

function assertDockerAvailable(): void {
  try {
    execSync('docker info', { stdio: 'ignore' });
  } catch {
    throw new Error(
      'Docker is not running. Server e2e tests require Docker for Testcontainers MySQL. Start Docker and run `npm run server:test:e2e` again.',
    );
  }
}

export default async function globalSetup(): Promise<void> {
  assertDockerAvailable();

  const container = await new MySqlContainer('mysql:8.4').start();

  const mysqlEnv = {
    NODE_ENV: 'e2e',
    MYSQL_HOST: container.getHost(),
    MYSQL_PORT: String(container.getPort()),
    MYSQL_USER: container.getUsername(),
    MYSQL_PASSWORD: container.getUserPassword(),
    MYSQL_DB: container.getDatabase(),
  };

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

  fs.writeFileSync(
    RUNTIME_ENV_PATH,
    JSON.stringify(
      {
        ...mysqlEnv,
        containerId: container.getId(),
      },
      null,
      2,
    ),
  );
}
