import { Link } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  <svg aria-hidden data-testid="test-icon">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

describe('IconButton', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(
        <IconButton aria-label="Test action">
          <TestIcon />
        </IconButton>,
      );
      expect(screen.getByRole('button', { name: 'Test action' })).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('applies default variant (ghost) and size (md)', () => {
      const { container } = render(
        <IconButton aria-label="Test action">
          <TestIcon />
        </IconButton>,
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('ghost');
      expect(button).toHaveClass('md');
    });

    it('renders with primary variant', () => {
      const { container } = render(
        <IconButton variant="primary" aria-label="Create">
          <TestIcon />
        </IconButton>,
      );
      expect(container.querySelector('button')).toHaveClass('primary');
    });

    it('renders with lg size', () => {
      const { container } = render(
        <IconButton size="lg" aria-label="Create">
          <TestIcon />
        </IconButton>,
      );
      expect(container.querySelector('button')).toHaveClass('lg');
    });

    it('applies custom className', () => {
      const { container } = render(
        <IconButton className="custom" aria-label="Test action">
          <TestIcon />
        </IconButton>,
      );
      expect(container.querySelector('button')).toHaveClass('custom');
    });

    it('renders as Link with href and without type attribute', () => {
      render(
        <IconButton as={Link} to="/create" variant="primary" size="lg" aria-label="Create workout list">
          <TestIcon />
        </IconButton>,
      );

      const link = screen.getByRole('link', { name: 'Create workout list' });
      expect(link).toHaveAttribute('href', '/create');
      expect(link).not.toHaveAttribute('type');
    });
  });

  describe('HTML attributes', () => {
    it('passes disabled attribute to DOM', () => {
      render(
        <IconButton disabled aria-label="Disabled action">
          <TestIcon />
        </IconButton>,
      );
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('passes title attribute to DOM', () => {
      render(
        <IconButton aria-label="Export" title="Export workout lists">
          <TestIcon />
        </IconButton>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Export workout lists');
    });

    it('passes type attribute to DOM', () => {
      const { container } = render(
        <IconButton type="submit" aria-label="Submit">
          <TestIcon />
        </IconButton>,
      );
      expect(container.querySelector('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(
        <IconButton aria-label="Click" onClick={handleClick}>
          <TestIcon />
        </IconButton>,
      );

      await user.click(screen.getByRole('button', { name: 'Click' }));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(
        <IconButton disabled aria-label="Disabled" onClick={handleClick}>
          <TestIcon />
        </IconButton>,
      );

      await user.click(screen.getByRole('button', { name: 'Disabled' }));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
