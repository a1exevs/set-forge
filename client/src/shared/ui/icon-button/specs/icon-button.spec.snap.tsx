import { Link } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

import IconButton from 'src/shared/ui/icon-button/icon-button';

jest.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    className,
    type: _type,
    ...rest
  }: {
    to: string;
    children: ReactNode;
    className?: string;
    type?: string;
  }) => (
    <a href={to} className={className} {...rest}>
      {children}
    </a>
  ),
}));

const TestIcon = (): JSX.Element => (
  <svg aria-hidden>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const VARIANTS = ['ghost', 'primary'] as const;
const SHAPES = ['square', 'circle'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

describe('IconButton', () => {
  it('matches snapshot for default', () => {
    const { container } = render(
      <IconButton aria-label="Action">
        <TestIcon />
      </IconButton>,
    );
    expect(container).toMatchSnapshot();
  });

  it.each(VARIANTS.flatMap(variant => SHAPES.flatMap(shape => SIZES.map(size => [variant, shape, size] as const))))(
    'matches snapshot for %s / %s / %s',
    (variant, shape, size) => {
      const { container } = render(
        <IconButton variant={variant} shape={shape} size={size} aria-label="Action">
          <TestIcon />
        </IconButton>,
      );
      expect(container).toMatchSnapshot();
    },
  );

  it('matches snapshot for disabled', () => {
    const { container } = render(
      <IconButton disabled aria-label="Disabled">
        <TestIcon />
      </IconButton>,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with title', () => {
    const { container } = render(
      <IconButton aria-label="Export" title="Export workout lists">
        <TestIcon />
      </IconButton>,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot as Link FAB', () => {
    const { container } = render(
      <IconButton as={Link} to="/create" variant="primary" shape="circle" size="lg" aria-label="Create workout list">
        <TestIcon />
      </IconButton>,
    );
    expect(container).toMatchSnapshot();
  });
});
