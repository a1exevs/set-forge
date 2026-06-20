import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ProfilePage from 'src/pages/profile/ui/profile-page';

jest.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: '/profile' } }),
}));

jest.mock('@widgets', () => ({
  MainTabsBar: (): JSX.Element => <nav data-testid="main-tabs-bar" />,
  MAIN_TAB_ROUTES: [
    { id: 'home', to: '/' },
    { id: 'profile', to: '/profile' },
  ],
}));

jest.mock('@shared', () => {
  const actual = jest.requireActual<typeof import('@shared')>('@shared');
  return {
    ...actual,
    useTabSwipeNavigation: () => ({ current: null }),
  };
});

describe('ProfilePage', () => {
  it('renders account info and logout button', () => {
    render(
      <ProfilePage email="jane@example.com" avatarLetter="J" onLogout={(): void => undefined} isLoggingOut={false} />,
    );

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    expect(screen.getByTestId('main-tabs-bar')).toBeInTheDocument();
  });

  it('calls onLogout when button clicked', async () => {
    const onLogout = jest.fn();
    const user = userEvent.setup();

    render(<ProfilePage email="jane@example.com" avatarLetter="J" onLogout={onLogout} isLoggingOut={false} />);

    await user.click(screen.getByRole('button', { name: 'Log out' }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('disables logout button while logging out', () => {
    render(<ProfilePage email="jane@example.com" avatarLetter="J" onLogout={(): void => undefined} isLoggingOut />);

    expect(screen.getByRole('button', { name: 'Log out' })).toBeDisabled();
  });
});
