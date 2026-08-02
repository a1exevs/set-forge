import type { StorybookConfig } from '@storybook/react-vite';
import path, { dirname, join } from 'path';
import { mergeConfig } from 'vite';

/**
 * Resolve package roots for npm workspaces: Storybook CLI loads presets from the
 * repo root, while @storybook/react-vite lives under client/node_modules.
 * @see https://storybook.js.org/docs/faq#how-do-i-fix-module-resolution-in-special-environments
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('storybook-addon-pseudo-states'),
  ],
  viteFinal: config => {
    return mergeConfig(config, {
      resolve: {
        alias: {
          src: path.resolve(__dirname, '../src'),
          'storybook-dir': path.resolve(__dirname, '.'),
          'src/entities/session/lib/bootstrap-session': path.resolve(__dirname, 'mock-bootstrap-session.ts'),
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
