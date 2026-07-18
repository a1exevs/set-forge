import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { useAcceptDocumentsMutation, useCurrentUserQuery, useLogoutMutation } from '@entities';

import DocumentReconsentGate from 'src/widgets/document-reconsent/ui/document-reconsent-gate';

jest.mock('@entities', () => ({
  useCurrentUserQuery: jest.fn(),
  useAcceptDocumentsMutation: jest.fn(),
  useLogoutMutation: jest.fn(),
}));

jest.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

const mockedCurrentUser = useCurrentUserQuery as jest.Mock;
const mockedAccept = useAcceptDocumentsMutation as jest.Mock;
const mockedLogout = useLogoutMutation as jest.Mock;

describe('DocumentReconsentGate', () => {
  const acceptMutation = { mutateAsync: jest.fn().mockResolvedValue(undefined), isPending: false, isError: false };
  const logoutMutation = { mutate: jest.fn(), isPending: false };

  beforeEach(() => {
    jest.clearAllMocks();
    acceptMutation.mutateAsync.mockResolvedValue(undefined);
    mockedAccept.mockReturnValue(acceptMutation);
    mockedLogout.mockReturnValue(logoutMutation);
  });

  it('renders nothing when acceptance is up to date', () => {
    mockedCurrentUser.mockReturnValue({ data: { id: 1, email: 'a@b.c', documentsPendingAcceptance: false } });
    render(<DocumentReconsentGate />);
    expect(screen.queryByText(/updated our documents/i)).not.toBeInTheDocument();
  });

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
    expect(logoutMutation.mutate).toHaveBeenCalledTimes(1);
  });
});
