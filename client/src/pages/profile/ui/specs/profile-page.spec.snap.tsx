import { render } from '@testing-library/react';
import { createRef, type ReactNode } from 'react';

import ProfilePage from '../profile-page';

jest.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: '/profile' } }),
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

jest.mock('@widgets/main-tabs-bar', () => ({
  MainTabsBar: (): JSX.Element => <nav data-testid="main-tabs-bar" />,
}));

jest.mock('@widgets/legal-footer', () => ({
  LegalFooter: (): JSX.Element => <footer data-testid="legal-footer" />,
}));

describe('ProfilePage', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <ProfilePage
        swipeRef={createRef<HTMLDivElement>()}
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
