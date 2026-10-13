import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { Dumbbell } from 'lucide-react';
import { FC, ReactElement, useState } from 'react';

import { Stack, withFrame } from 'storybook-dir/showcase';

import Select, { type SelectOption } from './select';

const MUSCLE_GROUPS: SelectOption[] = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'legs', label: 'Legs' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'arms', label: 'Arms' },
];

const meta: Meta<typeof Select> = {
  title: 'Shared/Select',
  component: Select,
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'A listbox (Headless UI): the button shows the selected label and an arrow that turns up while the list is ' +
          'open. Controlled through `value` and `onChange`; `options` are `{ value, label, lang? }` (`lang` when a ' +
          'label is in another language than the page); `disabled` dims it and keeps it closed. `appearance` is ' +
          '`field` (a form row, the list drops below) or `compact` (a borderless trigger with an optional `icon`, its ' +
          'list opens where it fits).',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

type StatefulProps = { initialValue: string; disabled?: boolean; compact?: boolean };

const StatefulSelect: FC<StatefulProps> = ({ initialValue, disabled, compact }) => {
  const [value, setValue] = useState(initialValue);

  return (
    <Stack>
      <Select
        value={value}
        options={MUSCLE_GROUPS}
        onChange={setValue}
        disabled={disabled}
        appearance={compact ? 'compact' : 'field'}
        icon={compact ? <Dumbbell size={16} strokeWidth={1.75} aria-hidden /> : undefined}
      />
    </Stack>
  );
};

/** Closed, showing the selected option. */
export const Default: Story = {
  render: (): ReactElement => <StatefulSelect initialValue="legs" />,
};

/** Opened: the list with the selected option highlighted, the arrow turned up. */
export const Open: Story = {
  render: (): ReactElement => <StatefulSelect initialValue="legs" />,
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button'));
  },
};

/** Disabled: dimmed, and a press does not open it. */
export const Disabled: Story = {
  render: (): ReactElement => <StatefulSelect initialValue="legs" disabled />,
};

/** Compact: a borderless trigger with an icon for a footer or a corner; opened, the list sits where it fits. */
export const Compact: Story = {
  render: (): ReactElement => <StatefulSelect initialValue="legs" compact />,
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button'));
  },
};
