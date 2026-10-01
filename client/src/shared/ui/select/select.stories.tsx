import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
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
          'A listbox (Headless UI): the button shows the selected label, the options drop below it. Controlled ' +
          'through `value` and `onChange`; `options` are `{ value, label }` pairs.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

type StatefulProps = { initialValue: string };

const StatefulSelect: FC<StatefulProps> = ({ initialValue }) => {
  const [value, setValue] = useState(initialValue);

  return (
    <Stack>
      <Select value={value} options={MUSCLE_GROUPS} onChange={setValue} />
    </Stack>
  );
};

/** Closed, showing the selected option. */
export const Default: Story = {
  render: (): ReactElement => <StatefulSelect initialValue="legs" />,
};

/** Opened: the list with the selected option highlighted. */
export const Open: Story = {
  render: (): ReactElement => <StatefulSelect initialValue="legs" />,
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button'));
  },
};
