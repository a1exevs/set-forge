import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import LegalFooter from 'src/widgets/legal-footer/ui/legal-footer';

jest.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

describe('LegalFooter', () => {
  it('links to the Privacy Policy and Terms of Service pages', () => {
    render(<LegalFooter />);

    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms');
  });

  it('merges a page-provided className for outer spacing', () => {
    const { container } = render(<LegalFooter className="page-spacing" />);

    expect(container.querySelector('footer')).toHaveClass('page-spacing');
  });
});
