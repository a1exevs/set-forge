import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';

import { Row, withFrame } from 'storybook-dir/showcase';

import Button from './button';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Variant[] = ['primary', 'secondary', 'danger'];
const SIZES: Size[] = ['sm', 'md', 'lg'];

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
          'every other prop goes to the `<button>`.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Primary, medium: the everyday form. */
export const Default: Story = {};

/** `primary` confirms, `secondary` steps aside, `danger` destroys. */
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
