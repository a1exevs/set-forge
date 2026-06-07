'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Match sequelize-cli environment resolution: `--env` / `-e` wins, else NODE_ENV, else development.
 * (CLI reads this file after argv is parsed, so we can inspect process.argv.)
 */
function getSequelizeEnv() {
  const argv = process.argv;
  for (let i = 0; i < argv.length; i++) {
    if ((argv[i] === '-e' || argv[i] === '--env') && argv[i + 1]) {
      return argv[i + 1];
    }
  }
  return process.env.NODE_ENV || 'development';
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

const sequelizeEnv = getSequelizeEnv();
const envFile = path.join(__dirname, '..', `.${sequelizeEnv}.env`);
loadEnvFile(envFile);

function mysqlConfig() {
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = Number(process.env.MYSQL_PORT || 3306);
  const username = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DB;

  if (!username || !database) {
    // eslint-disable-next-line no-console
    console.warn(
      `[sequelize config] MYSQL_USER / MYSQL_DB are missing after loading "${path.basename(
        envFile,
      )}". CLI uses database/config.js, not Nest ConfigModule — set MYSQL_* in that file or export them in the shell.`,
    );
  }

  return {
    dialect: 'mysql',
    host,
    port,
    username: username || 'change_me_db_user',
    password: password || 'change_me_db_password',
    database: database || 'change_me_db',
  };
}

const shared = mysqlConfig();

module.exports = {
  development: { ...shared },
  test: { ...shared },
  e2e: { ...shared },
  production: { ...shared },
};
