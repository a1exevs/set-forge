import { render, screen } from '@testing-library/react';

import BrandWordmark from 'src/shared/ui/brand-wordmark/brand-wordmark';

describe('BrandWordmark', () => {
  it('renders favicon and styled title for Workout lists', () => {
    render(<BrandWordmark title="Workout lists" />);

    expect(screen.getByText('Workout lists')).toBeInTheDocument();
    expect(document.querySelector('img[src="/favicon.svg"]')).toBeInTheDocument();
  });

  it('renders favicon and title', () => {
    render(<BrandWordmark title="Set Forge" />);

    expect(screen.getByText('Set Forge')).toBeInTheDocument();
    expect(document.querySelector('img[src="/favicon.svg"]')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<BrandWordmark title="Profile" className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });
});
