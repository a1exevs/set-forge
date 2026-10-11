import type { Meta, StoryObj } from '@storybook/react';
import { ComponentProps, FC, ReactElement, useState } from 'react';

import { Stack, withFrame } from 'storybook-dir/showcase';

import type { NumericVariant } from '@shared/lib';

import NumericField from './numeric-field-logic-layer';

type Size = NonNullable<ComponentProps<typeof NumericField>['size']>;

const meta: Meta<typeof NumericField> = {
  title: 'Shared/NumericField',
  component: NumericField,
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'A labelled number input that edits a draft string: `integer` keeps digits, `decimal` allows one dot. ' +
          '`onChange` receives the parsed number or `null` when the field is empty.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

type StatefulProps = {
  variant: NumericVariant;
  label: string;
  initialValue: number | null;
  error?: string;
  size?: Size;
  disabled?: boolean;
};

const StatefulNumericField: FC<StatefulProps> = ({ variant, label, initialValue, error, size, disabled }) => {
  const [value, setValue] = useState<number | null>(initialValue);

  return (
    <NumericField
      label={label}
      value={value}
      onChange={setValue}
      variant={variant}
      error={error}
      size={size}
      disabled={disabled}
    />
  );
};

/** Decimal, small: the weight field of an exercise card. */
export const Default: Story = {
  render: (): ReactElement => (
    <Stack>
      <StatefulNumericField variant="decimal" label="Weight (kg)" initialValue={80} size="sm" />
    </Stack>
  ),
};

/** `integer` (reps, sets) against `decimal` (weight): the keyboard and the sanitiser differ. */
export const Variant: Story = {
  render: (): ReactElement => (
    <Stack>
      <StatefulNumericField variant="integer" label="Reps" initialValue={10} size="sm" />
      <StatefulNumericField variant="decimal" label="Weight (kg)" initialValue={62.5} size="sm" />
    </Stack>
  ),
};

/** `sm` inside cards, `md` in forms. */
export const Size: Story = {
  render: (): ReactElement => (
    <Stack>
      <StatefulNumericField variant="integer" label="Sets (sm)" initialValue={3} size="sm" />
      <StatefulNumericField variant="integer" label="Sets (md)" initialValue={3} size="md" />
    </Stack>
  ),
};

/** Empty, invalid and disabled. */
export const States: Story = {
  render: (): ReactElement => (
    <Stack>
      <StatefulNumericField variant="integer" label="Reps" initialValue={null} size="sm" />
      <StatefulNumericField
        variant="integer"
        label="Reps"
        initialValue={null}
        size="sm"
        error="Enter a valid number of reps"
      />
      <StatefulNumericField variant="integer" label="Sets" initialValue={3} size="sm" disabled />
    </Stack>
  ),
};
