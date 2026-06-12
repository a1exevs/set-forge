import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import NotFoundMessage from 'src/widgets/not-found-message/ui/not-found-message';

jest.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

describe('NotFoundMessage', () => {
  describe('rendering', () => {
    it('renders title', () => {
      render(<NotFoundMessage title="Workout list not found" />);

      expect(screen.getByRole('heading', { name: 'Workout list not found' })).toBeInTheDocument();
    });

    it('renders Back to Home link', () => {
      render(<NotFoundMessage title="Workout list not found" />);

      expect(screen.getByRole('link', { name: 'Back to Home' })).toBeInTheDocument();
    });

    it('renders with custom title', () => {
      render(<NotFoundMessage title="Custom not found message" />);

      expect(screen.getByRole('heading', { name: 'Custom not found message' })).toBeInTheDocument();
    });

    it('uses default backToLink when not provided', () => {
      render(<NotFoundMessage title="Workout list not found" />);

      const link = screen.getByRole('link', { name: 'Back to Home' });
      expect(link).toHaveAttribute('href', '/');
    });

    it('uses custom backToLink when provided', () => {
      render(<NotFoundMessage title="Workout list not found" backToLink="/custom" />);

      const link = screen.getByRole('link', { name: 'Back to Home' });
      expect(link).toHaveAttribute('href', '/custom');
    });

    it('uses custom backToLabel when provided', () => {
      render(<NotFoundMessage title="Not found" backToLink="/" backToLabel="Go back" />);

      expect(screen.getByRole('link', { name: 'Go back' })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('link is clickable', async () => {
      const user = userEvent.setup();
      render(<NotFoundMessage title="Workout list not found" />);

      const link = screen.getByRole('link', { name: 'Back to Home' });
      await user.click(link);

      expect(link).toBeInTheDocument();
    });
  });
});
