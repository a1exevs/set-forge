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

const noop = (): void => undefined;
const asyncNoop = (): Promise<void> => Promise.resolve();

describe('ProfilePage', () => {
  it('renders account info, logout and delete-account buttons', () => {
    render(
      <ProfilePage
        email="jane@example.com"
        avatarLetter="J"
        onLogout={noop}
        isLoggingOut={false}
        onDeleteAccount={asyncNoop}
        isDeletingAccount={false}
      />,
    );

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete account' })).toBeInTheDocument();
    expect(screen.getByTestId('main-tabs-bar')).toBeInTheDocument();
  });

  it('calls onLogout when button clicked', async () => {
    const onLogout = jest.fn();
    const user = userEvent.setup();

    render(
      <ProfilePage
        email="jane@example.com"
        avatarLetter="J"
        onLogout={onLogout}
        isLoggingOut={false}
        onDeleteAccount={asyncNoop}
        isDeletingAccount={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Log out' }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('calls onDeleteAccount when delete button clicked', async () => {
    const onDeleteAccount = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <ProfilePage
        email="jane@example.com"
        avatarLetter="J"
        onLogout={noop}
        isLoggingOut={false}
        onDeleteAccount={onDeleteAccount}
        isDeletingAccount={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete account' }));

    expect(onDeleteAccount).toHaveBeenCalledTimes(1);
  });

  it('disables logout button while logging out', () => {
    render(
      <ProfilePage
        email="jane@example.com"
        avatarLetter="J"
        onLogout={noop}
        isLoggingOut
        onDeleteAccount={asyncNoop}
        isDeletingAccount={false}
      />,
    );

    expect(screen.getByRole('button', { name: 'Log out' })).toBeDisabled();
  });

  it('disables delete-account button while deleting', () => {
    render(
      <ProfilePage
        email="jane@example.com"
        avatarLetter="J"
        onLogout={noop}
        isLoggingOut={false}
        onDeleteAccount={asyncNoop}
        isDeletingAccount
      />,
    );

    expect(screen.getByRole('button', { name: 'Delete account' })).toBeDisabled();
  });
});
