import fs from 'fs';
import path from 'path';

import { rootDir } from './common';

enum IncreaseVersionMode {
  MAJOR = 'major',
  MINOR = 'minor',
  PATCH = 'patch',
}

/** App version is always taken from the client workspace; server stays in lockstep. */
const CANONICAL_PACKAGE_JSON = path.resolve(rootDir, 'client', 'package.json');
const PACKAGE_JSON_PATHS = [
  path.resolve(rootDir, 'client', 'package.json'),
  path.resolve(rootDir, 'server', 'package.json'),
];

function increaseVersion(version: string, type: IncreaseVersionMode): string {
  const parts = version.split('.').map(Number);

  switch (type) {
    case IncreaseVersionMode.MAJOR:
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case IncreaseVersionMode.MINOR:
      parts[1]++;
      parts[2] = 0;
      break;
    case IncreaseVersionMode.PATCH:
      parts[2]++;
      break;
    default:
      throw new Error(
        `Invalid version type: ${type}. Use "${IncreaseVersionMode.MAJOR}", "${IncreaseVersionMode.MINOR}" or "${IncreaseVersionMode.PATCH}".`,
      );
  }

  return parts.join('.');
}

function readVersion(filePath: string): string {
  const fileAbsolutePath = path.resolve(filePath);
  const content = fs.readFileSync(fileAbsolutePath, 'utf8');
  const json = JSON.parse(content) as { version?: string };
  if (!json.version) {
    throw new Error(`No "version" field found in ${filePath}`);
  }
  return json.version;
}

function setVersionInFile(filePath: string, newVersion: string): void {
  const fileAbsolutePath = path.resolve(filePath);
  const content = fs.readFileSync(fileAbsolutePath, 'utf8');
  const json = JSON.parse(content) as { version?: string };

  if (!json.version) {
    throw new Error(`No "version" field found in ${filePath}`);
  }

  const oldVersion = json.version;
  json.version = newVersion;

  fs.writeFileSync(fileAbsolutePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`Updated version in ${filePath}: ${oldVersion} -> ${newVersion}`);
}

function main(): void {
  const args = process.argv.slice(2);
  const type = args[0] as IncreaseVersionMode;

  if (![IncreaseVersionMode.MAJOR, IncreaseVersionMode.MINOR, IncreaseVersionMode.PATCH].includes(type)) {
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
          `Warning: version in ${path.relative(rootDir, pkgPath)} (${other}) differs from client (${oldCanonical}). Both will be set to ${newVersion}.`,
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
