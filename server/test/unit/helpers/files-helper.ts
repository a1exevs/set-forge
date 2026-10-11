import { existsSync, rmdirSync } from 'node:fs';

const removeTestDir = (dir: string) => {
  if (existsSync(dir)) {
    rmdirSync(dir, { recursive: true });
  }
};

export const removeTestLogsDir = () => {
  removeTestDir(process.env.SERVER_LOGS);
};
