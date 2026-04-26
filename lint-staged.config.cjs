const path = require('node:path');

const clientDir = path.join(__dirname, 'client');

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
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      throw new Error(`lint-staged: expected a path under client/, got ${file} (resolved: ${abs})`);
    }
    return rel.split(path.sep).join('/');
  });
}

module.exports = {
  'client/**/*.{ts,tsx}': (files) => {
    if (files.length === 0) {
      return [];
    }
    const rel = toClientRelativePosix(files);
    return [
      `prettier --ignore-path client/.prettierignore --write ${files.map((f) => JSON.stringify(f)).join(' ')}`,
      `npm exec -w @set-forge/client -- eslint --config eslint.config.ts --fix ${rel.map(quoteFileArg).join(' ')}`,
    ];
  },
  'client/{src,.storybook}/**/*.{css,scss}': ['prettier --ignore-path client/.prettierignore --write'],
  'scripts/**/*.{ts,tsx}': ['prettier --config client/.prettierrc.cjs --write'],
  'server/**/*.md': ['prettier --write'],
};
