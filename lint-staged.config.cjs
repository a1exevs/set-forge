const path = require("node:path");

const clientDir = path.join(__dirname, "client");
const serverDir = path.join(__dirname, "server");

/**
 * @param {string} filePath
 * @returns {string}
 */
function quoteFileArg(filePath) {
  if (/[\s'"]/u.test(filePath)) {
    return JSON.stringify(filePath);
  }
  return filePath;
}

/**
 * @param {string[]} absoluteOrCwdRelativePaths
 * @returns {string[]}
 */
function toClientRelativePosix(absoluteOrCwdRelativePaths) {
  return absoluteOrCwdRelativePaths.map((file) => {
    const abs = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
    const rel = path.relative(clientDir, abs);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      throw new Error(`lint-staged: expected a path under client/, got ${file} (resolved: ${abs})`);
    }
    return rel.split(path.sep).join("/");
  });
}

/**
 * @param {string[]} absoluteOrCwdRelativePaths
 * @returns {string[]}
 */
function toServerRelativePosix(absoluteOrCwdRelativePaths) {
  return absoluteOrCwdRelativePaths.map((file) => {
    const abs = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
    const rel = path.relative(serverDir, abs);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      throw new Error(`lint-staged: expected a path under server/, got ${file} (resolved: ${abs})`);
    }
    return rel.split(path.sep).join("/");
  });
}

/**
 * @param {string[]} files
 * @returns {string[]}
 */
function clientTsTasks(files) {
  if (files.length === 0) {
    return [];
  }
  const rel = toClientRelativePosix(files);
  return [
    `prettier --ignore-path client/.prettierignore --write ${files.map((f) => JSON.stringify(f)).join(" ")}`,
    `npm exec -w @set-forge/client -- eslint --config eslint.config.ts --fix ${rel.map(quoteFileArg).join(" ")}`,
  ];
}

function serverTsTasks(files) {
  if (files.length === 0) {
    return [];
  }
  const rel = toServerRelativePosix(files);
  return [
    `prettier --config server/.prettierrc.json --write ${files.map((f) => JSON.stringify(f)).join(" ")}`,
    `npm exec -w @set-forge/server -- eslint --fix ${rel.map(quoteFileArg).join(" ")}`,
  ];
}

module.exports = {
  "client/**/*.{ts,tsx}": clientTsTasks,
  "client/{src,.storybook}/**/*.{css,scss}": ["prettier --ignore-path client/.prettierignore --write"],
  "scripts/**/*.{ts,tsx}": ["prettier --config client/.prettierrc.cjs --write"],
  "server/{src,test}/**/*.ts": serverTsTasks,
};
