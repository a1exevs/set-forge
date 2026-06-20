import { render } from '@testing-library/react';
import { Home, User } from 'lucide-react';

import TabsBar from 'src/shared/ui/tabs-bar/tabs-bar';

jest.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    className,
    role,
    'aria-current': ariaCurrent,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
    role?: string;
    'aria-current'?: 'page';
  }) => (
    <a href={to} className={className} role={role} aria-current={ariaCurrent}>
      {children}
    </a>
  ),
}));

const items = [
  { id: 'home', label: 'Home', to: '/', icon: Home },
  { id: 'profile', label: 'Profile', to: '/profile', icon: User },
];

describe('TabsBar', () => {
  it('matches snapshot with active home tab', () => {
    const { container } = render(<TabsBar items={items} activeItemId="home" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with active profile tab', () => {
    const { container } = render(<TabsBar items={items} activeItemId="profile" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with badge', () => {
    const { container } = render(
      <TabsBar items={[{ id: 'home', label: 'Home', to: '/', icon: Home, badgeCount: 10 }]} activeItemId="home" />,
    );
    expect(container).toMatchSnapshot();
  });
});
