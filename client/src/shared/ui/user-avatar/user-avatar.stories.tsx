import type { Meta, StoryObj } from '@storybook/react';

import UserAvatar from 'src/shared/ui/user-avatar/user-avatar';

const meta = {
  title: 'Shared/UserAvatar',
  component: UserAvatar,
} satisfies Meta<typeof UserAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    letter: 'J',
  },
};
