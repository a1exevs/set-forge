import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from '@storybook/test';

import { withFrame } from 'storybook-dir/showcase';

import UserAvatarMenu from './user-avatar-menu';

const ARIA_LABEL = 'Account menu for jane@example.com';

const meta = {
  title: 'Shared/UserAvatarMenu',
  component: UserAvatarMenu,
  args: {
    letter: 'J',
    ariaLabel: ARIA_LABEL,
    items: [
      { id: 'profile', label: 'Profile', onClick: fn() },
      { id: 'logout', label: 'Log out', onClick: fn() },
    ],
  },
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'The account menu of the page header: a `UserAvatar`-styled trigger that opens a list of actions ' +
          '(Headless UI `Menu`). `ariaLabel` names the trigger, `items` are the actions.',
      },
    },
  },
} satisfies Meta<typeof UserAvatarMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: the monogram is the trigger. */
export const Default: Story = {};

/** Opened: the items anchor below the trigger. */
export const Open: Story = {
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: ARIA_LABEL }));
  },
};
