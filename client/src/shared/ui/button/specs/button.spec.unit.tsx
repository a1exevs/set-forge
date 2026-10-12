import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Button from '../button';

describe('Button', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('applies default variant (primary) and size (md)', () => {
      const { container } = render(<Button>Button</Button>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('primary');
      expect(button).toHaveClass('md');
    });

    it('renders with primary variant', () => {
      const { container } = render(<Button variant="primary">Primary</Button>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('primary');
    });

    it('renders with secondary variant', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('secondary');
    });

    it('renders with danger variant', () => {
      const { container } = render(<Button variant="danger">Danger</Button>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('danger');
    });

    it('renders with sm size', () => {
      const { container } = render(<Button size="sm">Small</Button>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('sm');
    });

    it('renders with md size', () => {
      const { container } = render(<Button size="md">Medium</Button>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('md');
    });

    it('renders with lg size', () => {
      const { container } = render(<Button size="lg">Large</Button>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('lg');
    });

    it('applies custom className', () => {
      const { container } = render(<Button className="custom">Custom</Button>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('custom');
    });
  });

  describe('HTML attributes', () => {
    it('passes disabled attribute to DOM', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('passes type attribute to DOM', () => {
      const { container } = render(<Button type="submit">Submit</Button>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('passes aria-label to DOM', () => {
      render(<Button aria-label="Close dialog">×</Button>);
      expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Click</Button>);

      await user.click(screen.getByRole('button', { name: 'Click' }));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('progress', () => {
    it('ignores a press while locked, keeping the label as the name', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(
        <Button progress="locked" onClick={handleClick}>
          Save
        </Button>,
      );

      const button = screen.getByRole('button', { name: 'Save' });
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).not.toBeDisabled();
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    });

    it('shows an indicator announced as loading when shown', () => {
      render(<Button progress="shown">Save</Button>);

      const button = screen.getByRole('button', { name: /Save/ });
      expect(button).toHaveAttribute('data-progress', 'shown');
      expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('does not submit its form while in flight', async () => {
      const handleSubmit = jest.fn((event: { preventDefault: () => void }): void => event.preventDefault());
      const user = userEvent.setup();
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit" progress="shown">
            Log in
          </Button>
        </form>,
      );

      await user.click(screen.getByRole('button', { name: /Log in/ }));

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('is a plain button when idle', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Save</Button>);

      const button = screen.getByRole('button', { name: 'Save' });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(button).not.toHaveAttribute('aria-busy');
      expect(button).not.toHaveAttribute('data-progress');
    });
  });
});
