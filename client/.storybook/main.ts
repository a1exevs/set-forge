import type { StorybookConfig } from '@storybook/react-vite';
import path, { dirname, join } from 'path';
import { mergeConfig, type Plugin } from 'vite';

/**
 * Resolve package roots for npm workspaces: Storybook CLI loads presets from the
 * repo root, while @storybook/react-vite lives under client/node_modules.
 * @see https://storybook.js.org/docs/faq#how-do-i-fix-module-resolution-in-special-environments
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}

const bootstrapSessionFile = path.resolve(__dirname, '../src/entities/session/model/bootstrap-session.ts');

/**
 * Swaps the real session bootstrap for a stub. Matches the resolved file, not the specifier: inside its slice the
 * module is imported by a relative path (`./model/bootstrap-session`), so a string alias would never hit.
 */
function mockBootstrapSession(): Plugin {
  return {
    name: 'mock-bootstrap-session',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!source.endsWith('bootstrap-session') || importer?.endsWith('mock-bootstrap-session.ts')) {
        return null;
      }
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      return resolved && path.normalize(resolved.id) === bootstrapSessionFile
        ? path.resolve(__dirname, 'mock-bootstrap-session.ts')
        : null;
    },
  };
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-interactions'),
    // Accessibility panel: axe runs on the open story; keep it green (see .claude/rules/storybook.md).
    // TODO: run every story in CI with @storybook/test-runner + axe-playwright (play functions and axe violations
    //   on every PR, not only Chromatic on `testing`). Storybook 9 replaces the test-runner with the Vitest addon —
    //   decide between the two at the upgrade, and whether Jest stays for unit tests next to it.
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('storybook-addon-pseudo-states'),
  ],
  viteFinal: config => {
    return mergeConfig(config, {
      plugins: [mockBootstrapSession()],
      resolve: {
        alias: {
          src: path.resolve(__dirname, '../src'),
          'storybook-dir': path.resolve(__dirname, '.'),
          // Add other aliases from vite.config.ts if needed
        },
      },
    });
  },
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
};
export default config;
