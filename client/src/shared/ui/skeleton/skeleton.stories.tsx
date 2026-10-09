import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';

import { Row, Stack, withFrame } from 'storybook-dir/showcase';

import Skeleton from './skeleton';

const meta = {
  title: 'Shared/Skeleton',
  component: Skeleton,
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'A placeholder bone shown while a screen loads its data: `text` a line, `rect` a block, `circle` an icon. ' +
          '`width` and `height` take any CSS length. It pulses calmly, keeps still under `prefers-reduced-motion` ' +
          'and is hidden from assistive technology — the container that lays the bones out names the loading once.',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A line of text at the full width of its container. */
export const Default: Story = {};

/** `text` a line, `rect` a block, `circle` an icon. */
export const Variant: Story = {
  render: (args): ReactElement => (
    <Row>
      <Skeleton {...args} variant="text" width="8rem" />
      <Skeleton {...args} variant="rect" width="8rem" height="2.5rem" />
      <Skeleton {...args} variant="circle" />
    </Row>
  ),
};

/** `text` takes the shape of known copy: one bar per wrapped line, so the bone wraps exactly like the text will. */
export const TextShape: Story = {
  render: (args): ReactElement => (
    <Stack>
      <Skeleton
        {...args}
        text="Ready to train? Tap Start workout only when you are about to begin — the timer starts then, so your workout duration in history stays accurate."
      />
    </Stack>
  ),
};

/** Lines of different widths stacked the way a paragraph or a card would lay them out. */
export const Sizes: Story = {
  render: (args): ReactElement => (
    <Stack>
      <Skeleton {...args} width="60%" height="1.5rem" />
      <Skeleton {...args} />
      <Skeleton {...args} width="80%" />
      <Skeleton {...args} width="40%" height="0.75rem" />
    </Stack>
  ),
};
