import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';

import { Row, withFrame } from 'storybook-dir/showcase';

import UserAvatar from './user-avatar';

const LETTERS = ['A', 'J', 'Я', 'Ω'];

const meta = {
  title: 'Shared/UserAvatar',
  component: UserAvatar,
  args: { letter: 'J' },
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'A round monogram of the user: one letter the caller derives from the e-mail. Decorative (`aria-hidden`), ' +
          'the name lives on the surrounding control.',
      },
    },
  },
} satisfies Meta<typeof UserAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One upper-case letter. */
export const Default: Story = {};

/** Any alphabet fits the circle. */
export const Letters: Story = {
  render: (args): ReactElement => (
    <Row>
      {LETTERS.map((letter: string) => (
        <UserAvatar key={letter} {...args} letter={letter} />
      ))}
    </Row>
  ),
};
