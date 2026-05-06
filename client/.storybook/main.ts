import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
    'storybook-addon-pseudo-states',
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
    name: '@storybook/react-vite',
    options: {},
  },
};
export default config;
