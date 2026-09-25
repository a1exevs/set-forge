import type { Meta, StoryObj } from '@storybook/react';

import MenuButton from './menu-button';
import type { MenuButtonItem } from './menu-button';

const defaultItems: MenuButtonItem[] = [
  { id: 'edit', label: 'Edit', onClick: (): void => undefined },
  { id: 'delete', label: 'Delete', onClick: (): void => undefined },
];

const meta = {
  title: 'Shared/MenuButton',
  component: MenuButton,
  args: { items: defaultItems },
} satisfies Meta<typeof MenuButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const CustomAriaLabel: Story = { args: { ariaLabel: 'Workout list actions' } };
export const SingleItem: Story = {
  args: {
    items: [{ id: 'edit', label: 'Edit', onClick: (): void => undefined }],
  },
};
