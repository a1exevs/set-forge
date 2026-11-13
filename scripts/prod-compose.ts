// The production compose stack (`docker compose --profile prod`) for the host scripts on the VDS: commands run
// from the repository root, so the compose project, its volumes and the root .env are the ones of this checkout.
// Needs Node only (no `npm install`): nothing but Node built-ins.

import { execFileSync } from 'node:child_process';

import { rootDir } from './common.ts';

const COMPOSE = ['compose', '--profile', 'prod'];

/** Runs a command with its output shown; a non-zero exit throws. */
export function run(command: string, args: string[]): void {
  execFileSync(command, args, { cwd: rootDir, stdio: 'inherit' });
}

/** The trimmed stdout of a command, its stderr shown; a non-zero exit throws. */
export function capture(command: string, args: string[]): string {
  return execFileSync(command, args, { cwd: rootDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
}

/** Whether a command exits with 0, its output hidden. */
export function succeeds(command: string, args: string[]): boolean {
  try {
    execFileSync(command, args, { cwd: rootDir, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/** Runs `docker compose --profile prod <args>` with its output shown; a non-zero exit throws. */
export function compose(args: string[]): void {
  run('docker', [...COMPOSE, ...args]);
}

/** The arguments that start `docker compose --profile prod <args>`, for a caller that spawns it itself. */
export function composeArgs(args: string[]): string[] {
  return [...COMPOSE, ...args];
}

/** Whether a service of the stack has a running container. */
export function isRunning(service: string): boolean {
  return capture('docker', [...COMPOSE, 'ps', '--status', 'running', '--services'])
    .split(/\r?\n/)
    .includes(service);
}

/** Prints a failure and ends the process with the given exit status. */
export function fail(message: string, status = 1): never {
  process.stderr.write(`\n${message}\n`);
  process.exit(status);
}

/** The message of a thrown value. */
export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
