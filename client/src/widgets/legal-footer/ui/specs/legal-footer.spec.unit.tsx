import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { t } from 'tests/common/translate';

import LegalFooter from '../legal-footer';

jest.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

describe('LegalFooter', () => {
  it('links to the Privacy Policy and Terms of Use pages', () => {
    render(<LegalFooter t={t} />);

    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute('href', '/terms');
  });

  it('merges a page-provided className for outer spacing', () => {
    const { container } = render(<LegalFooter t={t} className="page-spacing" />);

    expect(container.querySelector('footer')).toHaveClass('page-spacing');
  });
});
