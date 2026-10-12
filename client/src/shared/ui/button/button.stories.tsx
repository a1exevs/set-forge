import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps, ReactElement } from 'react';

import { Row, withFrame } from 'storybook-dir/showcase';

import type { Progress as ProgressState } from '@shared/lib';

import Button from './button';

type Variant = NonNullable<ComponentProps<typeof Button>['variant']>;
type Size = NonNullable<ComponentProps<typeof Button>['size']>;

const VARIANTS: Variant[] = ['primary', 'secondary', 'danger', 'accent'];
const SIZES: Size[] = ['sm', 'md', 'lg'];
const PROGRESSES: ProgressState[] = ['idle', 'locked', 'shown'];

const meta = {
  title: 'Shared/Button',
  component: Button,
  args: { children: 'Save' },
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'The pressable control of the app (Headless UI `Button`). `variant` is the intent, `size` the footprint; ' +
          '`progress` shows the request of the action; every other prop goes to the `<button>`.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Primary, medium: the everyday form. */
export const Default: Story = {};

/** `primary` confirms, `secondary` steps aside, `danger` destroys, `accent` starts the main thing of a screen. */
export const Variant: Story = {
  render: (args): ReactElement => (
    <Row>
      {VARIANTS.map((variant: Variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </Row>
  ),
};

/** Three sizes on the type scale of the form fields. */
export const Size: Story = {
  render: (args): ReactElement => (
    <Row>
      {SIZES.map((size: Size) => (
        <Button key={size} {...args} size={size}>
          {size}
        </Button>
      ))}
    </Row>
  ),
};

/** Disabled in every variant: the colour dims, the label stays. */
export const Disabled: Story = {
  render: (args): ReactElement => (
    <Row>
      {VARIANTS.map((variant: Variant) => (
        <Button key={variant} {...args} variant={variant} disabled>
          {variant}
        </Button>
      ))}
    </Row>
  ),
};

/** `progress`: `locked` ignores presses and keeps the look, `shown` swaps the label for an indicator — same size. */
export const Progress: Story = {
  render: (args): ReactElement => (
    <Row>
      {PROGRESSES.map((progress: ProgressState) => (
        <Button key={progress} {...args} progress={progress}>
          Create account
        </Button>
      ))}
    </Row>
  ),
};
