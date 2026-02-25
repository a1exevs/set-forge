import fs from 'fs';
import path from 'path';

import { rootDir } from './common';

enum IncreaseVersionMode {
  MAJOR = 'major',
  MINOR = 'minor',
  PATCH = 'patch',
}

const PATH_TO_PACKAGE_JSON = path.resolve(rootDir, 'package.json');

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

function updateVersionInFile(filePath: string, type: IncreaseVersionMode): void {
  const fileAbsolutePath = path.resolve(filePath);
  const content = fs.readFileSync(fileAbsolutePath, 'utf8');
  const json = JSON.parse(content);

  if (!json.version) {
    throw new Error(`No "version" field found in ${filePath}`);
  }

  const oldVersion = json.version;
  const newVersion = increaseVersion(oldVersion, type);
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
    updateVersionInFile(PATH_TO_PACKAGE_JSON, type);
  } catch (error: unknown) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
}

main();
