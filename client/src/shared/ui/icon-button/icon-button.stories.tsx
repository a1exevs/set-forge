import type { Meta, StoryObj } from '@storybook/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { Download, Plus } from 'lucide-react';
import type { ReactElement } from 'react';

import IconButton from 'src/shared/ui/icon-button/icon-button';

type Variant = 'ghost' | 'primary';
type Shape = 'square' | 'circle';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Variant[] = ['ghost', 'primary'];
const SHAPES: Shape[] = ['square', 'circle'];
const SIZES: Size[] = ['sm', 'md', 'lg'];

const meta = {
  title: 'Shared/IconButton',
  component: IconButton,
  args: {
    'aria-label': 'Action',
    children: <Download size={18} strokeWidth={1.75} aria-hidden />,
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const iconForSize = (size: Size): JSX.Element =>
  size === 'lg' ? (
    <Plus size={24} strokeWidth={2} aria-hidden />
  ) : (
    <Download size={18} strokeWidth={1.75} aria-hidden />
  );

const combinationArgs = (variant: Variant, shape: Shape, size: Size): Story['args'] => ({
  variant,
  shape,
  size,
  children: iconForSize(size),
  'aria-label': `${variant} ${shape} ${size}`,
});

export const GhostSquareSm: Story = { args: combinationArgs('ghost', 'square', 'sm') };
export const GhostSquareMd: Story = { args: combinationArgs('ghost', 'square', 'md') };
export const GhostSquareLg: Story = { args: combinationArgs('ghost', 'square', 'lg') };
export const GhostCircleSm: Story = { args: combinationArgs('ghost', 'circle', 'sm') };
export const GhostCircleMd: Story = { args: combinationArgs('ghost', 'circle', 'md') };
export const GhostCircleLg: Story = { args: combinationArgs('ghost', 'circle', 'lg') };
export const PrimarySquareSm: Story = { args: combinationArgs('primary', 'square', 'sm') };
export const PrimarySquareMd: Story = { args: combinationArgs('primary', 'square', 'md') };
export const PrimarySquareLg: Story = { args: combinationArgs('primary', 'square', 'lg') };
export const PrimaryCircleSm: Story = { args: combinationArgs('primary', 'circle', 'sm') };
export const PrimaryCircleMd: Story = { args: combinationArgs('primary', 'circle', 'md') };
export const PrimaryCircleLg: Story = { args: combinationArgs('primary', 'circle', 'lg') };

export const AllCombinations: Story = {
  render: (): JSX.Element => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, auto)',
        gap: '1rem',
        padding: '1.5rem',
        alignItems: 'center',
        justifyItems: 'center',
      }}
    >
      {VARIANTS.flatMap(variant =>
        SHAPES.flatMap(shape =>
          SIZES.map(size => (
            <IconButton
              key={`${variant}-${shape}-${size}`}
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
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };
export const WithTitle: Story = {
  args: {
    title: 'Export workout lists',
    'aria-label': 'Export workout lists',
  },
};

const renderAsLink = (): ReactElement => {
  const rootRoute = createRootRoute({
    component: (): JSX.Element => <Outlet />,
  });

  const createRouteNode = createRoute({
    getParentRoute: () => rootRoute,
    path: '/create',
    component: (): null => null,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: (): JSX.Element => (
      <IconButton
        as={Link}
        to="/create"
        variant="primary"
        shape="circle"
        size="lg"
        aria-label="Create workout list"
        title="Create workout list"
      >
        <Plus size={24} strokeWidth={2} aria-hidden />
      </IconButton>
    ),
  });

  const routeTree = rootRoute.addChildren([indexRoute, createRouteNode]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

  return <RouterProvider router={router} />;
};

export const AsLinkFab: Story = {
  render: renderAsLink,
};
