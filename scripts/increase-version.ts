import { readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { rootDir } from './common.ts';

const IncreaseVersionMode = {
  MAJOR: 'major',
  MINOR: 'minor',
  PATCH: 'patch',
} as const;
type IncreaseVersionMode = (typeof IncreaseVersionMode)[keyof typeof IncreaseVersionMode];

/** App version is always taken from the client workspace; server stays in lockstep. */
const CANONICAL_PACKAGE_JSON = resolve(rootDir, 'client', 'package.json');
const PACKAGE_JSON_PATHS = [
  resolve(rootDir, 'client', 'package.json'),
  resolve(rootDir, 'client', 'public', 'manifest.json'),
  resolve(rootDir, 'server', 'package.json'),
];

function increaseVersion(version: string, type: IncreaseVersionMode): string {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number);

  switch (type) {
    case IncreaseVersionMode.MAJOR:
      return [major + 1, 0, 0].join('.');
    case IncreaseVersionMode.MINOR:
      return [major, minor + 1, 0].join('.');
    case IncreaseVersionMode.PATCH:
      return [major, minor, patch + 1].join('.');
    default:
      throw new Error(
        `Invalid version type: ${type}. Use "${IncreaseVersionMode.MAJOR}", "${IncreaseVersionMode.MINOR}" or "${IncreaseVersionMode.PATCH}".`,
      );
  }
}

function readVersion(filePath: string): string {
  const fileAbsolutePath = resolve(filePath);
  const content = readFileSync(fileAbsolutePath, 'utf8');
  const json = JSON.parse(content) as { version?: string };
  if (!json.version) {
    throw new Error(`No "version" field found in ${filePath}`);
  }
  return json.version;
}

function setVersionInFile(filePath: string, newVersion: string): void {
  const fileAbsolutePath = resolve(filePath);
  const content = readFileSync(fileAbsolutePath, 'utf8');
  const json = JSON.parse(content) as { version?: string };

  if (!json.version) {
    throw new Error(`No "version" field found in ${filePath}`);
  }

  const oldVersion = json.version;
  json.version = newVersion;

  writeFileSync(fileAbsolutePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`Updated version in ${filePath}: ${oldVersion} -> ${newVersion}`);
}

function main(): void {
  const args = process.argv.slice(2);
  const type = args[0] as IncreaseVersionMode;

  if (!Object.values(IncreaseVersionMode).includes(type)) {
    console.error('Usage: node increase-version.ts <major|minor|patch>');
    process.exit(1);
  }

  try {
    const oldCanonical = readVersion(CANONICAL_PACKAGE_JSON);
    const newVersion = increaseVersion(oldCanonical, type);

    for (const pkgPath of PACKAGE_JSON_PATHS) {
      if (pkgPath === CANONICAL_PACKAGE_JSON) {
        continue;
      }
      const other = readVersion(pkgPath);
      if (other !== oldCanonical) {
        console.warn(
          `Warning: version in ${relative(rootDir, pkgPath)} (${other}) differs from client (${oldCanonical}). Both will be set to ${newVersion}.`,
        );
      }
    }

    for (const pkgPath of PACKAGE_JSON_PATHS) {
      setVersionInFile(pkgPath, newVersion);
    }
  } catch (error: unknown) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
}

main();
