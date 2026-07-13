#!/usr/bin/env bash
set -euo pipefail

# patch, minor, major
versionType=${1:-}

if [[ -z "$versionType" ]]; then
  echo "Need to set version type: patch, minor, or major"
  exit 1
fi

case $versionType in
  patch|minor|major) ;;
  *)
    echo "Incorrect parameter: $versionType. Please use patch, minor, or major."
    exit 1
    ;;
esac

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Working tree is not clean. Commit or stash changes before running this script."
  exit 1
fi

git fetch origin develop common/version-increase

git checkout common/version-increase 2>/dev/null || git checkout -b common/version-increase origin/common/version-increase

# Align with latest develop instead of merging. After a version PR lands on develop,
# both branches touch the same version files and merge often conflicts.
git reset --hard origin/develop

prevVersion=$(sed -n -e 's/.*"version": "\(.*\)",/\1/p' client/package.json | head -1)
echo "Previous version: $prevVersion"

npm run "version:$versionType"

newVersion=$(sed -n -e 's/.*"version": "\(.*\)",/\1/p' client/package.json | head -1)
echo "New version: $newVersion"

git add client/package.json client/public/manifest.json server/package.json

git commit -m "[Common] Version increase v$newVersion"

git push --force-with-lease origin common/version-increase
