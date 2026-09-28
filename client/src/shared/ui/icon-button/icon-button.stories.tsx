import type { Meta, StoryObj } from '@storybook/react';
import { Link } from '@tanstack/react-router';
import { Download, Plus } from 'lucide-react';
import type { ReactElement } from 'react';

import { renderWithRouter } from 'storybook-dir/render-with-router';
import { Grid, Row, withFrame } from 'storybook-dir/showcase';

import IconButton from './icon-button';

type Variant = 'ghost' | 'primary';
type Shape = 'square' | 'circle';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Variant[] = ['ghost', 'primary'];
const SHAPES: Shape[] = ['square', 'circle'];
const SIZES: Size[] = ['sm', 'md', 'lg'];

const iconForSize = (size: Size): ReactElement =>
  size === 'lg' ? (
    <Plus size={24} strokeWidth={2} aria-hidden />
  ) : (
    <Download size={18} strokeWidth={1.75} aria-hidden />
  );

const meta = {
  title: 'Shared/IconButton',
  component: IconButton,
  args: {
    'aria-label': 'Download',
    children: iconForSize('md'),
  },
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'A button that shows an icon only; `aria-label` is its name. `as={Link}` with `to` renders a router link ' +
          'in the same skin.',
      },
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Ghost, square, medium: the toolbar form. */
export const Default: Story = {};

/** Every variant and shape at every size; the icon grows with `size`. */
export const Matrix: Story = {
  render: (args): ReactElement => (
    <Grid columns={SIZES.length}>
      {VARIANTS.flatMap((variant: Variant) =>
        SHAPES.flatMap((shape: Shape) =>
          SIZES.map((size: Size) => (
            <IconButton
              key={`${variant}-${shape}-${size}`}
              {...args}
              variant={variant}
              shape={shape}
              size={size}
              aria-label={`${variant} ${shape} ${size}`}
              title={`${variant} / ${shape} / ${size}`}
            >
              {iconForSize(size)}
            </IconButton>
          )),
        ),
      )}
    </Grid>
  ),
};

/** Disabled in both variants. */
export const Disabled: Story = {
  render: (args): ReactElement => (
    <Row>
      {VARIANTS.map((variant: Variant) => (
        <IconButton key={variant} {...args} variant={variant} disabled />
      ))}
    </Row>
  ),
};

/** The floating "create" button of the home page: a router `Link` as a primary circle. */
export const AsLink: Story = {
  render: (): ReactElement =>
    renderWithRouter({
      paths: ['/create'],
      component: (): ReactElement => (
        <IconButton
          as={Link}
          to="/create"
          variant="primary"
          shape="circle"
          size="lg"
          aria-label="Create workout list"
          title="Create workout list"
        >
          {iconForSize('lg')}
        </IconButton>
      ),
    }),
};
