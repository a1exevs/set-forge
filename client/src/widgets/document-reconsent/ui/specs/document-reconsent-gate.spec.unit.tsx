import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { useAcceptDocumentsMutation, useCurrentUserQuery } from '@entities/session';
import { useLogout } from '@features/logout';

import DocumentReconsentGate from '../document-reconsent-gate-data-layer';

jest.mock('@entities/session', () => ({
  useCurrentUserQuery: jest.fn(),
  useAcceptDocumentsMutation: jest.fn(),
}));

jest.mock('@features/logout', () => ({
  useLogout: jest.fn(),
}));

jest.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
  useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: mockPathname } }),
}));

let mockPathname = '/';

const mockedCurrentUser = useCurrentUserQuery as jest.Mock;
const mockedAccept = useAcceptDocumentsMutation as jest.Mock;
const mockedLogout = useLogout as jest.Mock;

describe('DocumentReconsentGate', () => {
  const acceptMutation = { mutateAsync: jest.fn().mockResolvedValue(undefined), isPending: false, isError: false };
  const logout = { logout: jest.fn().mockResolvedValue(undefined), leave: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/';
    acceptMutation.mutateAsync.mockResolvedValue(undefined);
    mockedAccept.mockReturnValue(acceptMutation);
    mockedLogout.mockReturnValue(logout);
  });

  it('renders nothing when acceptance is up to date', () => {
    mockedCurrentUser.mockReturnValue({ data: { id: 1, email: 'a@b.c', documentsPendingAcceptance: false } });
    render(<DocumentReconsentGate />);
    expect(screen.queryByText(/updated our documents/i)).not.toBeInTheDocument();
  });

  // @invariant session/reconsent-gate
  it('stays closed on /privacy and /terms so the documents remain readable', () => {
    mockedCurrentUser.mockReturnValue({ data: { id: 1, email: 'a@b.c', documentsPendingAcceptance: true } });
    mockPathname = '/privacy';
    const { rerender } = render(<DocumentReconsentGate />);
    expect(screen.queryByText(/updated our documents/i)).not.toBeInTheDocument();

    mockPathname = '/terms';
    rerender(<DocumentReconsentGate />);
    expect(screen.queryByText(/updated our documents/i)).not.toBeInTheDocument();
  });

  // @invariant session/reconsent-gate
  it('blocks with two checkboxes; Accept is enabled only when both are checked', async () => {
    mockedCurrentUser.mockReturnValue({ data: { id: 1, email: 'a@b.c', documentsPendingAcceptance: true } });
    const user = userEvent.setup();
    render(<DocumentReconsentGate />);

    expect(await screen.findByText(/updated our documents/i)).toBeInTheDocument();
    const acceptButton = screen.getByRole('button', { name: 'Accept' });
    const consentCheckbox = screen.getByRole('checkbox', { name: /personal data/i });
    const termsCheckbox = screen.getByRole('checkbox', { name: /Terms of Use/i });

    expect(acceptButton).toBeDisabled();
    await user.click(consentCheckbox);
    expect(acceptButton).toBeDisabled();
    await user.click(termsCheckbox);
    expect(acceptButton).toBeEnabled();

    await user.click(acceptButton);
    expect(acceptMutation.mutateAsync).toHaveBeenCalledTimes(1);
  });

  it('logs out when Log out is clicked', async () => {
    mockedCurrentUser.mockReturnValue({ data: { id: 1, email: 'a@b.c', documentsPendingAcceptance: true } });
    const user = userEvent.setup();
    render(<DocumentReconsentGate />);

    await user.click(await screen.findByRole('button', { name: 'Log out' }));
    expect(logout.logout).toHaveBeenCalledTimes(1);
    await waitFor((): void => expect(logout.leave).toHaveBeenCalledTimes(1));
  });

  it('locks Log out while Accept is in flight and ignores a second Accept', async () => {
    mockedCurrentUser.mockReturnValue({ data: { id: 1, email: 'a@b.c', documentsPendingAcceptance: true } });
    acceptMutation.mutateAsync.mockReturnValue(new Promise<void>((): void => undefined));
    const user = userEvent.setup();
    render(<DocumentReconsentGate />);

    await user.click(await screen.findByRole('checkbox', { name: /personal data/i }));
    await user.click(screen.getByRole('checkbox', { name: /Terms of Use/i }));
    await user.click(screen.getByRole('button', { name: 'Accept' }));
    await user.click(screen.getByRole('button', { name: 'Accept' }));
    await user.click(screen.getByRole('button', { name: 'Log out' }));

    expect(acceptMutation.mutateAsync).toHaveBeenCalledTimes(1);
    expect(logout.logout).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: /personal data/i })).toBeDisabled();
  });

  it('stays open until the progress of Accept is over, although the documents are already accepted', async () => {
    mockedCurrentUser.mockReturnValue({ data: { id: 1, email: 'a@b.c', documentsPendingAcceptance: true } });
    let answer: () => void = (): void => undefined;
    acceptMutation.mutateAsync.mockReturnValue(
      new Promise<void>((resolve): void => {
        answer = resolve;
      }),
    );
    const user = userEvent.setup();
    const { rerender } = render(<DocumentReconsentGate />);

    await user.click(await screen.findByRole('checkbox', { name: /personal data/i }));
    await user.click(screen.getByRole('checkbox', { name: /Terms of Use/i }));
    await user.click(screen.getByRole('button', { name: 'Accept' }));
    mockedCurrentUser.mockReturnValue({ data: { id: 1, email: 'a@b.c', documentsPendingAcceptance: false } });
    rerender(<DocumentReconsentGate />);

    expect(screen.getByText(/updated our documents/i)).toBeInTheDocument();

    answer();
    await waitFor((): void => expect(screen.queryByText(/updated our documents/i)).not.toBeInTheDocument());
  });
});
