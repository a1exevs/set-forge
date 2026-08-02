/** Dedicated ports so client e2e does not collide with local `client:dev` / `server:start:dev`. */

import ports from 'tests/e2e/stack/ports.json';

export const E2E_CLIENT_PORT = ports.clientPort;
export const E2E_SERVER_PORT = ports.serverPort;

export const E2E_CLIENT_ORIGIN = `http://localhost:${E2E_CLIENT_PORT}`;
export const E2E_SERVER_ORIGIN = `http://localhost:${E2E_SERVER_PORT}`;
export const E2E_HEALTH_URL = `${E2E_SERVER_ORIGIN}/api/1.0/health`;
