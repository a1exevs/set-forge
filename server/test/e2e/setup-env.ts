import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const RUNTIME_ENV_PATH = join(__dirname, '.runtime-env.json');

if (!existsSync(RUNTIME_ENV_PATH)) {
  throw new Error('Missing test/e2e/.runtime-env.json. Ensure Jest globalSetup ran successfully before e2e specs.');
}

const runtimeEnv = JSON.parse(readFileSync(RUNTIME_ENV_PATH, 'utf8')) as Record<string, string>;

process.env.NODE_ENV = 'e2e';
process.env.MYSQL_HOST = runtimeEnv.MYSQL_HOST;
process.env.MYSQL_PORT = runtimeEnv.MYSQL_PORT;
process.env.MYSQL_USER = runtimeEnv.MYSQL_USER;
process.env.MYSQL_PASSWORD = runtimeEnv.MYSQL_PASSWORD;
process.env.MYSQL_DB = runtimeEnv.MYSQL_DB;
