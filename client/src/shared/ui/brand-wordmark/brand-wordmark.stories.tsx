import type { Meta, StoryObj } from '@storybook/react';

import { withFrame } from 'storybook-dir/showcase';

import BrandWordmark from './brand-wordmark';

const meta = {
  title: 'Shared/BrandWordmark',
  component: BrandWordmark,
  args: { title: 'Set Forge' },
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'The app icon with a title next to it. `leadingTitle` puts a word before the icon; `titleAs` makes the ' +
          'title the page heading.',
      },
    },
  },
} satisfies Meta<typeof BrandWordmark>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Icon and the app name: the auth page header. */
export const Default: Story = {};

/** The main page header: the app name leads, the page title is the `h1`. */
export const WithLeadingTitle: Story = {
  args: { leadingTitle: 'Set Forge', title: 'Workout lists', titleAs: 'h1' },
};

/** No title: the icon alone, for tight headers. */
export const IconOnly: Story = {
  args: { title: undefined },
};
