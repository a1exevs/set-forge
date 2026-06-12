import type { Meta, StoryObj } from '@storybook/react';

import UserAvatarMenu from 'src/shared/ui/user-avatar-menu/user-avatar-menu';

const meta: Meta<typeof UserAvatarMenu> = {
  title: 'Shared/UserAvatarMenu',
  component: UserAvatarMenu,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof UserAvatarMenu>;

export const Default: Story = {
  args: {
    letter: 'J',
    ariaLabel: 'Account menu for jane@example.com',
    items: [{ id: 'logout', label: 'Log out', onClick: (): void => undefined }],
  },
};
