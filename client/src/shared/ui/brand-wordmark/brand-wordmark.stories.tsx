import type { Meta, StoryObj } from '@storybook/react';

import BrandWordmark from 'src/shared/ui/brand-wordmark/brand-wordmark';

const meta = {
  title: 'Shared/BrandWordmark',
  component: BrandWordmark,
} satisfies Meta<typeof BrandWordmark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SetForge: Story = {
  args: {
    title: 'Set Forge',
  },
};

export const WorkoutLists: Story = {
  args: {
    title: 'Workout lists',
  },
};

export const Profile: Story = {
  args: {
    title: 'Profile',
  },
};
