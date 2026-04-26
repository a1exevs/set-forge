import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Button from 'src/shared/ui/button/button';

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
});
