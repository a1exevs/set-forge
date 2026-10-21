import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { t } from 'tests/common/translate';

import MainTabsBar from '../main-tabs-bar';

jest.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    role,
    'aria-current': ariaCurrent,
  }: {
    to: string;
    children: ReactNode;
    role?: string;
    'aria-current'?: 'page';
  }) => (
    <a href={to} role={role} aria-current={ariaCurrent}>
      {children}
    </a>
  ),
}));

describe('MainTabsBar', () => {
  it('names the navigation and every tab from the dictionary', () => {
    render(<MainTabsBar activeItemId="history" t={t} />);

    expect(screen.getByRole('tablist', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('tab', { name: 'History' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('tab', { name: 'Profile' })).toHaveAttribute('href', '/profile');
  });
});
