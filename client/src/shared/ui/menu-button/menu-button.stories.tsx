import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from '@storybook/test';

import { withFrame } from 'storybook-dir/showcase';

import MenuButton from './menu-button';

const ARIA_LABEL = 'Workout list actions';

const meta = {
  title: 'Shared/MenuButton',
  component: MenuButton,
  args: {
    ariaLabel: ARIA_LABEL,
    items: [
      { id: 'edit', label: 'Edit', onClick: fn() },
      { id: 'delete', label: 'Delete', onClick: fn() },
    ],
  },
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'The kebab menu of a card (Headless UI `Menu`): a vertical-ellipsis trigger and a list of actions. ' +
          '`ariaLabel` names the trigger; each item closes the menu after its `onClick`.',
      },
    },
  },
} satisfies Meta<typeof MenuButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: the ellipsis is the trigger. */
export const Default: Story = {};

/** Opened: the actions anchor below the trigger. */
export const Open: Story = {
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: ARIA_LABEL }));
  },
};
