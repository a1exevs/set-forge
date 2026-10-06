import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { FC, ReactElement, useState } from 'react';

import { Caption, Stack, withFrame } from 'storybook-dir/showcase';

import PasswordField from './password-field-logic-layer';

const meta: Meta<typeof PasswordField> = {
  title: 'Shared/PasswordField',
  component: PasswordField,
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'A password input with a show / hide toggle (`aria-pressed` carries the state); `revealable={false}` ' +
          'drops the toggle and keeps the value hidden. Controlled through `value` and `onChange`; the label is ' +
          'the caller’s.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

type StatefulProps = {
  id: string;
  initialValue?: string;
  disabled?: boolean;
  revealable?: boolean;
};

const StatefulPasswordField: FC<StatefulProps> = ({ id, initialValue = '', disabled, revealable }) => {
  const [value, setValue] = useState(initialValue);

  return (
    <Stack>
      <label htmlFor={id}>Password</label>
      <PasswordField
        id={id}
        name="password"
        autoComplete="current-password"
        value={value}
        onChange={setValue}
        disabled={disabled}
        revealable={revealable}
      />
    </Stack>
  );
};

/** Filled and hidden: the sign-in form. */
export const Default: Story = {
  render: (): ReactElement => <StatefulPasswordField id="password" initialValue="secret" />,
};

/** The toggle pressed: the value is readable. */
export const Visible: Story = {
  render: (): ReactElement => <StatefulPasswordField id="password" initialValue="secret" />,
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Show password' }));
  },
};

/** Empty, disabled and without the toggle (the register form). */
export const States: Story = {
  render: (): ReactElement => (
    <Stack>
      <Caption>Empty</Caption>
      <StatefulPasswordField id="password-empty" />
      <Caption>Disabled</Caption>
      <StatefulPasswordField id="password-disabled" initialValue="secret" disabled />
      <Caption>Without toggle</Caption>
      <StatefulPasswordField id="password-plain" initialValue="secret" revealable={false} />
    </Stack>
  ),
};
