import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { ConfirmDialogProvider } from '@shared/ui';

import ProfilePageLogicLayer from '../profile-page-logic-layer';

jest.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: '/profile' } }),
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

jest.mock('@widgets/main-tabs-bar', () => ({
  MainTabsBar: (): JSX.Element => <nav data-testid="main-tabs-bar" />,
  useMainTabSwipe: (): { current: null } => ({ current: null }),
}));

jest.mock('@widgets/legal-footer', () => ({
  LegalFooter: (): JSX.Element => <footer data-testid="legal-footer" />,
}));

type Handlers = { onLogout: jest.Mock; onDeleteAccount: jest.Mock; onLeave: jest.Mock };

const renderProfile = ({ onLogout, onDeleteAccount, onLeave }: Handlers): void => {
  render(
    <ConfirmDialogProvider>
      <ProfilePageLogicLayer
        email="jane@example.com"
        avatarLetter="J"
        onLogout={onLogout}
        onDeleteAccount={onDeleteAccount}
        onLeave={onLeave}
      />
    </ConfirmDialogProvider>,
  );
};

const pending = (): { promise: Promise<void>; resolve: () => void } => {
  let resolve: () => void = (): void => undefined;
  const promise = new Promise<void>((res): void => {
    resolve = res;
  });
  return { promise, resolve };
};

describe('ProfilePageLogicLayer', () => {
  // @invariant session/logout-ends-on-login
  it('leaves for /login after the logout answers, and locks Delete account meanwhile', async () => {
    const request = pending();
    const handlers: Handlers = {
      onLogout: jest.fn(() => request.promise),
      onDeleteAccount: jest.fn(),
      onLeave: jest.fn(),
    };
    const user = userEvent.setup();
    renderProfile(handlers);

    await user.click(screen.getByRole('button', { name: 'Log out' }));
    await user.click(screen.getByRole('button', { name: 'Log out' }));
    await user.click(screen.getByRole('button', { name: 'Delete account' }));

    expect(handlers.onLogout).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Delete account?')).not.toBeInTheDocument();
    expect(handlers.onLeave).not.toHaveBeenCalled();

    request.resolve();
    await waitFor((): void => expect(handlers.onLeave).toHaveBeenCalledTimes(1));
  });

  // @invariant session/logout-ends-on-login
  it('deletes the account inside its dialog, then leaves for /login', async () => {
    const request = pending();
    const handlers: Handlers = {
      onLogout: jest.fn(),
      onDeleteAccount: jest.fn(() => request.promise),
      onLeave: jest.fn(),
    };
    const user = userEvent.setup();
    renderProfile(handlers);

    await user.click(screen.getByRole('button', { name: 'Delete account' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Delete account' }));

    expect(handlers.onDeleteAccount).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Delete account?')).toBeInTheDocument();
    expect(handlers.onLeave).not.toHaveBeenCalled();

    request.resolve();
    await waitFor((): void => expect(handlers.onLeave).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('Delete account?')).not.toBeInTheDocument();
  });

  it('stays on the profile when the deletion is cancelled', async () => {
    const handlers: Handlers = { onLogout: jest.fn(), onDeleteAccount: jest.fn(), onLeave: jest.fn() };
    const user = userEvent.setup();
    renderProfile(handlers);

    await user.click(screen.getByRole('button', { name: 'Delete account' }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancel' }));

    expect(handlers.onDeleteAccount).not.toHaveBeenCalled();
    expect(handlers.onLeave).not.toHaveBeenCalled();
  });
});
