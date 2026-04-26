# patch, minor, major
versionType=$1

# input parameter check
if [[ -z "$versionType" ]]; then
  echo "Need to set version type: patch, minor, or major"
  exit 1
fi

# Merge branches
git checkout develop
git pull origin develop
git checkout common/version-increase
git pull origin common/version-increase
git merge develop

# Previous version (canonical: client workspace)
prevVersion=$( sed -n -e 's/.*"version": "\(.*\)",/\1/p' client/package.json | head -1 )
echo "Previous version: $prevVersion"

case $versionType in
  patch)
    npm run version:patch
    ;;
  minor)
    npm run version:minor
    ;;
  major)
    npm run version:major
    ;;
  *)
    echo "Incorrect parameter: $versionType. Please use patch, minor, or major."
    exit 1
    ;;
esac

newVersion=$( sed -n -e 's/.*"version": "\(.*\)",/\1/p' client/package.json | head -1 )
echo "New version: $newVersion"

git add client/package.json server/package.json

git commit -m "[Common] Version increase v$newVersion"

git push origin common/version-increase
