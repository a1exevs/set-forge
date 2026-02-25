# patch, minor, major
versionType=$1

# input parameter check
if [[ -z "$versionType" ]]; then
  echo "Need to set version type: patch, minor or major"
  exit 1
fi

# Merge branches
git checkout develop
git pull origin develop
git checkout common/version-increase
git pull origin common/version-increase
git merge develop

# Previous version in package.json
prevVersion=$( sed -n -e 's/.*"version": "\(.*\)",/\1/p' package.json | head -1 )
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
    echo "Incorrect parameter: $versionType. Please use patch, minor or major."
    exit 1
    ;;
esac


# increased version in package.json
newVersion=$( sed -n -e 's/.*"version": "\(.*\)",/\1/p' package.json | head -1 )
echo "New version: $newVersion"

git add package.json

git commit -m "[Common] Version increase v$newVersion"

git push origin common/version-increase
