import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { type ApiErrorItem, ApiRequestError } from '@shared/api';
import { useLanguageStore } from '@shared/lib';

import type { AuthTab } from '../../model/auth-tab';
import AuthPageLogicLayer from '../auth-page-logic-layer';

jest.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

const PASSWORD = 'correct-horse';

const serverFailure = (status: number, errors: ApiErrorItem[], resultCode = 1): ApiRequestError =>
  new ApiRequestError(status, {
    data: null,
    messages: errors.map(item => item.message),
    fieldsErrors: errors,
    resultCode,
  });

describe('AuthPageLogicLayer', () => {
  const onLogin = jest.fn().mockResolvedValue(undefined);
  const onRegister = jest.fn().mockResolvedValue(undefined);
  const onAuthenticated = jest.fn().mockResolvedValue(undefined);

  const renderTab = (activeTab: AuthTab): void => {
    render(
      <AuthPageLogicLayer
        activeTab={activeTab}
        redirectSearch={{}}
        onLogin={onLogin}
        onRegister={onRegister}
        onAuthenticated={onAuthenticated}
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
      });
      expect(onAuthenticated).toHaveBeenCalledWith(undefined);
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

  describe('language', () => {
    it('lets a guest switch the language on the sign-in screen and keeps the choice', async () => {
      const user = userEvent.setup();
      renderTab('login');

      await user.click(screen.getByRole('button', { name: /^Language/ }));
      await user.click(screen.getByRole('option', { name: 'Русский' }));

      expect(useLanguageStore.getState().language).toBe('ru');
      expect(JSON.parse(localStorage.getItem('language-storage') ?? '{}')).toMatchObject({ state: { language: 'ru' } });
      expect(screen.getByRole('button', { name: /^Язык/ })).toHaveTextContent('Русский');
    });
  });

  describe('submit in flight', () => {
    it('locks the fields and ignores a second Log in until the answer', async () => {
      let answer: () => void = (): void => undefined;
      onLogin.mockImplementationOnce(
        () =>
          new Promise<void>((resolve): void => {
            answer = resolve;
          }),
      );
      const user = userEvent.setup();
      renderTab('login');
      await user.type(screen.getByLabelText('Email'), 'jane@example.com');
      await user.type(screen.getByLabelText('Password'), PASSWORD);

      await user.click(screen.getByRole('button', { name: 'Log in' }));
      await user.click(screen.getByRole('button', { name: 'Log in' }));

      expect(onLogin).toHaveBeenCalledTimes(1);
      expect(screen.getByLabelText('Email')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Log in' })).toHaveAttribute('aria-busy', 'true');
      expect(onAuthenticated).not.toHaveBeenCalled();

      answer();
      await waitFor((): void => expect(onAuthenticated).toHaveBeenCalledWith(undefined));
    });

    it('unlocks the form and shows the error when the login fails', async () => {
      onLogin.mockRejectedValueOnce(new Error('offline'));
      const user = userEvent.setup();
      renderTab('login');
      await user.type(screen.getByLabelText('Email'), 'jane@example.com');
      await user.type(screen.getByLabelText('Password'), PASSWORD);

      await user.click(screen.getByRole('button', { name: 'Log in' }));

      expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).not.toBeDisabled();
      expect(screen.getByRole('button', { name: 'Log in' })).not.toHaveAttribute('aria-busy');
      expect(onAuthenticated).not.toHaveBeenCalled();
    });
  });

  // @invariant session/server-errors-in-language
  describe('server errors', () => {
    const logIn = async (): Promise<void> => {
      const user = userEvent.setup();
      renderTab('login');
      await user.type(screen.getByLabelText('Email'), 'jane@example.com');
      await user.type(screen.getByLabelText('Password'), PASSWORD);
      await user.click(screen.getByRole('button', { name: 'Log in' }));
    };

    it('shows a wrong password in the chosen language', async () => {
      act((): void => useLanguageStore.getState().setLanguage('ru'));
      onLogin.mockRejectedValueOnce(
        serverFailure(401, [{ code: 'INVALID_EMAIL_OR_PASSWORD', params: {}, message: 'Invalid email or password' }]),
      );

      await logIn();

      expect(await screen.findByText('Неверный email или пароль')).toBeInTheDocument();
    });

    it('puts a field error under its field and the rest at the form level', async () => {
      onLogin.mockRejectedValueOnce(
        serverFailure(400, [
          { code: 'MUST_BE_A_STRING', params: {}, field: 'email', message: 'Must be a string' },
          { code: 'MUST_BE_A_STRING', params: {}, field: 'nickname', message: 'Must be a string' },
          { code: 'SOMETHING_NEW', params: {}, message: 'Something new happened' },
        ]),
      );

      await logIn();

      const emailError = await screen.findAllByText('Must be a string');
      expect(emailError).toHaveLength(1);
      expect(screen.getByText('Something new happened Must be a string')).toBeInTheDocument();
    });

    it('asks for the captcha with its text when the server demands it', async () => {
      onLogin.mockRejectedValueOnce(
        serverFailure(
          401,
          [
            { code: 'INVALID_EMAIL_OR_PASSWORD', params: {}, message: 'Invalid email or password' },
            { code: 'NEED_AUTHORIZATION_WITH_CAPTCHA', params: {}, message: 'Captcha verification required' },
          ],
          10,
        ),
      );

      await logIn();

      expect(await screen.findByText('Invalid email or password Captcha verification required')).toBeInTheDocument();
    });
  });
});
