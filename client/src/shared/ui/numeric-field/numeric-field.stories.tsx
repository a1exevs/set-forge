import type { Meta, StoryObj } from '@storybook/react';
import { FC, useState } from 'react';

import NumericField from 'src/shared/ui/numeric-field/numeric-field-logic-layer';

const meta: Meta<typeof NumericField> = {
  title: 'Shared/NumericField',
  component: NumericField,
};

export default meta;
type Story = StoryObj<typeof meta>;

type StatefulProps = {
  variant: 'integer' | 'decimal';
  label: string;
  initialValue: number | null;
  error?: string;
  size?: 'md' | 'sm';
};

const StatefulNumericField: FC<StatefulProps> = ({ variant, label, initialValue, error, size }) => {
  const [value, setValue] = useState<number | null>(initialValue);

  return (
    <div style={{ padding: '1.5rem', maxWidth: 320 }}>
      <NumericField label={label} value={value} onChange={setValue} variant={variant} error={error} size={size} />
    </div>
  );
};

export const DecimalDefault: Story = {
  render: (): JSX.Element => <StatefulNumericField variant="decimal" label="Weight (kg)" initialValue={80} size="sm" />,
};

export const IntegerDefault: Story = {
  render: (): JSX.Element => <StatefulNumericField variant="integer" label="Reps" initialValue={10} size="sm" />,
};

export const Empty: Story = {
  render: (): JSX.Element => <StatefulNumericField variant="integer" label="Reps" initialValue={null} size="sm" />,
};

export const WithError: Story = {
  render: (): JSX.Element => (
    <StatefulNumericField
      variant="integer"
      label="Reps"
      initialValue={null}
      size="sm"
      error="Enter a valid number of reps"
    />
  ),
};

export const DecimalMedium: Story = {
  render: (): JSX.Element => (
    <StatefulNumericField variant="decimal" label="Weight (kg)" initialValue={62.5} size="md" />
  ),
};

export const Disabled: Story = {
  render: (): JSX.Element => (
    <div style={{ padding: '1.5rem', maxWidth: 320 }}>
      <NumericField label="Sets" value={3} onChange={(): void => undefined} variant="integer" size="sm" disabled />
    </div>
  ),
};
