import { render } from '@testing-library/react';
import { createRef, type ReactNode } from 'react';

import { t } from 'tests/common/translate';

import ProfilePage from '../profile-page';

jest.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: '/profile' } }),
  // Only the attributes the real link renders for an IconButton (its link snapshot has no `type`).
  Link: ({
    to,
    children,
    'aria-label': ariaLabel,
    title,
    className,
  }: Record<string, string> & { children: ReactNode }) => (
    <a href={to} aria-label={ariaLabel} title={title} className={className}>
      {children}
    </a>
  ),
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
        t={t}
        swipeRef={createRef<HTMLDivElement>()}
        email="jane@example.com"
        avatarLetter="J"
        logoutProgress="idle"
        deleteAccountProgress="idle"
        onLogout={(): void => undefined}
        onDeleteAccount={(): Promise<void> => Promise.resolve()}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
