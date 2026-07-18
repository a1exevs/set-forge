import { render } from '@testing-library/react';

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
  it('matches snapshot', () => {
    const { container } = render(
      <ProfilePage
        email="jane@example.com"
        avatarLetter="J"
        onLogout={(): void => undefined}
        isLoggingOut={false}
        onDeleteAccount={(): Promise<void> => Promise.resolve()}
        isDeletingAccount={false}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
