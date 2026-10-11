import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import type { AuthTab } from '../../model/auth-tab';
import AuthPageLogicLayer from '../auth-page-logic-layer';

jest.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

const PASSWORD = 'correct-horse';

describe('AuthPageLogicLayer', () => {
  const onLogin = jest.fn().mockResolvedValue(undefined);
  const onRegister = jest.fn().mockResolvedValue(undefined);

  const renderTab = (activeTab: AuthTab): void => {
    render(
      <AuthPageLogicLayer
        activeTab={activeTab}
        redirectSearch={{}}
        isSubmitting={false}
        onLogin={onLogin}
        onRegister={onRegister}
        loadCaptchaUrl={jest.fn()}
      />,
    );
  };

  const fillRegister = async (user: ReturnType<typeof userEvent.setup>, confirmPassword: string): Promise<void> => {
    await user.type(screen.getByLabelText('Email'), 'new@user.io');
    await user.type(screen.getByLabelText('Password'), PASSWORD);
    if (confirmPassword) {
      await user.type(screen.getByLabelText('Confirm password'), confirmPassword);
    }
    await user.click(screen.getByRole('checkbox', { name: /personal data/i }));
    await user.click(screen.getByRole('checkbox', { name: /Terms of Use/i }));
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register tab', () => {
    it('shows Password and Confirm password, both hidden and without a show / hide toggle', () => {
      renderTab('register');
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText('Confirm password')).toHaveAttribute('type', 'password');
      expect(screen.queryByRole('button', { name: /show password/i })).not.toBeInTheDocument();
    });

    it('marks both fields as a new password for password managers', () => {
      renderTab('register');
      expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password');
      expect(screen.getByLabelText('Confirm password')).toHaveAttribute('autocomplete', 'new-password');
    });

    // @invariant session/register-password-confirmed
    it('does not register when the passwords differ', async () => {
      const user = userEvent.setup();
      renderTab('register');
      await fillRegister(user, `${PASSWORD}-typo`);

      await user.click(screen.getByRole('button', { name: 'Create account' }));

      expect(onRegister).not.toHaveBeenCalled();
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    // @invariant session/register-password-confirmed
    it('does not register when Confirm password is empty', async () => {
      const user = userEvent.setup();
      renderTab('register');
      await fillRegister(user, '');

      await user.click(screen.getByRole('button', { name: 'Create account' }));

      expect(onRegister).not.toHaveBeenCalled();
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    // @invariant session/register-password-confirmed
    it('registers with equal passwords and never sends the confirmation', async () => {
      const user = userEvent.setup();
      renderTab('register');
      await fillRegister(user, PASSWORD);

      await user.click(screen.getByRole('button', { name: 'Create account' }));

      expect(onRegister).toHaveBeenCalledWith({
        email: 'new@user.io',
        password: PASSWORD,
        consent: true,
        termsAccepted: true,
        redirectTo: undefined,
      });
      expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
    });

    it('accepts a pasted Confirm password', async () => {
      const user = userEvent.setup();
      renderTab('register');
      const confirm = screen.getByLabelText('Confirm password');

      await user.click(confirm);
      await user.paste(PASSWORD);

      expect(confirm).toHaveValue(PASSWORD);
    });
  });

  describe('login tab', () => {
    it('shows one password field with the show / hide toggle', () => {
      renderTab('login');
      expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
      expect(screen.queryByLabelText('Confirm password')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument();
    });
  });
});
