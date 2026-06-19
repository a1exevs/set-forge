import { render, screen } from '@testing-library/react';
import { Bell, Home, MessageCircle, MoreHorizontal, Play, User } from 'lucide-react';
import type { ReactNode } from 'react';

import TabsBar from 'src/shared/ui/tabs-bar/tabs-bar';
import type { TabsBarItem } from 'src/shared/ui/tabs-bar/tabs-bar';

jest.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    className,
    role,
    'aria-current': ariaCurrent,
  }: {
    to: string;
    children: ReactNode;
    className?: string;
    role?: string;
    'aria-current'?: 'page';
  }) => (
    <a href={to} className={className} role={role} aria-current={ariaCurrent}>
      {children}
    </a>
  ),
}));

const twoTabs: TabsBarItem[] = [
  { id: 'home', label: 'Home', to: '/', icon: Home },
  { id: 'profile', label: 'Profile', to: '/profile', icon: User },
];

describe('TabsBar', () => {
  it('renders all tab links', () => {
    render(<TabsBar items={twoTabs} activeItemId="home" />);

    expect(screen.getByRole('tab', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('tab', { name: /profile/i })).toHaveAttribute('href', '/profile');
  });

  it('marks active tab with aria-current', () => {
    render(<TabsBar items={twoTabs} activeItemId="profile" />);

    expect(screen.getByRole('tab', { name: /home/i })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('tab', { name: /profile/i })).toHaveAttribute('aria-current', 'page');
  });

  it('renders badge count when provided', () => {
    const items: TabsBarItem[] = [
      ...twoTabs,
      { id: 'messages', label: 'Messages', to: '/messages', icon: MessageCircle, badgeCount: 10 },
    ];

    render(<TabsBar items={items} activeItemId="home" />);

    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('caps badge count at 99+', () => {
    const items: TabsBarItem[] = [
      { id: 'notifications', label: 'Notifications', to: '/notifications', icon: Bell, badgeCount: 140 },
    ];

    render(<TabsBar items={items} activeItemId="notifications" />);

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('supports five-tab reference layout', () => {
    const items: TabsBarItem[] = [
      { id: 'home', label: 'Home', to: '/', icon: Home },
      { id: 'video', label: 'Video', to: '/video', icon: Play },
      { id: 'messages', label: 'Messages', to: '/messages', icon: MessageCircle, badgeCount: 10 },
      { id: 'notifications', label: 'Notifications', to: '/notifications', icon: Bell, badgeCount: 14 },
      { id: 'more', label: 'More', to: '/more', icon: MoreHorizontal },
    ];

    render(<TabsBar items={items} activeItemId="home" />);

    expect(screen.getAllByRole('tab')).toHaveLength(5);
  });
});
