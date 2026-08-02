import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { FC, useState } from 'react';

import PasswordField from 'src/shared/ui/password-field/password-field-logic-layer';

const meta: Meta<typeof PasswordField> = {
  title: 'Shared/PasswordField',
  component: PasswordField,
};

export default meta;
type Story = StoryObj<typeof meta>;

type StatefulProps = {
  initialValue?: string;
  autoComplete?: string;
  name?: string;
  disabled?: boolean;
};

const StatefulPasswordField: FC<StatefulProps> = ({ initialValue = '', autoComplete, name, disabled }) => {
  const [value, setValue] = useState(initialValue);

  return (
    <div style={{ padding: '1.5rem', maxWidth: 360 }}>
      <label htmlFor="story-password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
        Password
      </label>
      <PasswordField
        id="story-password"
        name={name}
        value={value}
        onChange={setValue}
        autoComplete={autoComplete}
        disabled={disabled}
      />
    </div>
  );
};

export const Empty: Story = {
  render: (): JSX.Element => <StatefulPasswordField name="password" />,
};

export const WithValue: Story = {
  render: (): JSX.Element => (
    <StatefulPasswordField initialValue="secret" name="password" autoComplete="current-password" />
  ),
};

export const Visible: Story = {
  render: (): JSX.Element => (
    <StatefulPasswordField initialValue="secret" name="password" autoComplete="current-password" />
  ),
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show password' }));
  },
};

export const Disabled: Story = {
  render: (): JSX.Element => <StatefulPasswordField initialValue="secret" name="password" disabled />,
};
