import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

import ProfilePage from '../profile-page';

jest.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: '/profile' } }),
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

jest.mock('@widgets/main-tabs-bar', () => ({
  MainTabsBar: (): JSX.Element => <nav data-testid="main-tabs-bar" />,
  MAIN_TAB_ROUTES: [
    { id: 'home', to: '/' },
    { id: 'profile', to: '/profile' },
  ],
}));

jest.mock('@widgets/legal-footer', () => ({
  LegalFooter: (): JSX.Element => <footer data-testid="legal-footer" />,
}));

jest.mock('@shared/lib', () => {
  const actual = jest.requireActual<typeof import('@shared/lib')>('@shared/lib');
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
