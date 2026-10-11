import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';

import { renderWithRouter } from 'storybook-dir/render-with-router';
import { withFrame } from 'storybook-dir/showcase';

import NotFoundMessage from './not-found-message';

const meta = {
  title: 'Shared/NotFoundMessage',
  component: NotFoundMessage,
  args: { title: 'Workout list not found' },
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'The empty state of a page whose entity is gone: a title and a button that links back. `backToLink` ' +
          'defaults to home, `backToLabel` to "Back to Home".',
      },
    },
  },
  render: (args): ReactElement =>
    renderWithRouter({
      paths: [args.backToLink ?? '/'],
      component: (): ReactElement => <NotFoundMessage {...args} />,
    }),
} satisfies Meta<typeof NotFoundMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default way back is home. */
export const Default: Story = {};

/** A custom destination and label. */
export const CustomBackTo: Story = {
  args: { backToLink: '/history', backToLabel: 'Back to history' },
};
