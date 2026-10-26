import type { Nullable } from '@alexevs/ts-guards';
import { FC, FormEvent, useCallback, useState } from 'react';

import {
  isNeedCaptchaEnvelope,
  validateLoginEmail,
  validateLoginPassword,
  validateRegisterEmail,
  validateRegisterPassword,
} from '@entities/session';
import { ApiRequestError } from '@shared/api';
import { useProgress, useT } from '@shared/lib';

import AuthPage from './auth-page';
import { authErrorText, serverFailureTexts } from '../lib/auth-error-texts';
import type { AuthField, AuthFieldErrors, ServerFailure } from '../model/auth-form-error';
import type { LoginInput, RegisterInput } from '../model/auth-input';
import type { AuthTab } from '../model/auth-tab';

type Props = {
  activeTab: AuthTab;
  redirectSearch: Record<string, string | undefined>;
  onLogin: (input: LoginInput) => Promise<void>;
  onRegister: (input: RegisterInput) => Promise<void>;
  /** The next step after a successful login or registration. */
  onAuthenticated: (redirectTo: string | undefined) => Promise<void>;
  loadCaptchaUrl: () => Promise<string>;
};

const AuthPageLogicLayer: FC<Props> = ({
  activeTab,
  redirectSearch,
  onLogin,
  onRegister,
  onAuthenticated,
  loadCaptchaUrl,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [captchaImageUrl, setCaptchaImageUrl] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  // Codes and the rejected request, not texts: an error on screen follows a language switch
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [failure, setFailure] = useState<Nullable<ServerFailure>>(null);
  const { run, progressOf, busy } = useProgress<'submit'>();
  const { t } = useT();

  const redirectTo = typeof redirectSearch.redirect === 'string' ? redirectSearch.redirect : undefined;

  const resetErrors = useCallback((): void => {
    setFieldErrors({});
    setFailure(null);
  }, []);

  // Shows the checks of a submit; true when one of them failed
  const showFieldErrors = useCallback((checks: AuthFieldErrors): boolean => {
    setFieldErrors(checks);
    return Object.values(checks).some(Boolean);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      resetErrors();

      if (activeTab === 'register') {
        const invalid = showFieldErrors({
          email: validateRegisterEmail(email),
          password: validateRegisterPassword(password),
          confirmPassword: confirmPassword === password ? null : 'passwordsMismatch',
          consent: consent ? null : 'consentRequired',
          termsAccepted: termsAccepted ? null : 'termsRequired',
        });
        if (invalid) {
          return;
        }
        try {
          if (await run('submit', () => onRegister({ email: email.trim(), password, consent, termsAccepted }))) {
            await onAuthenticated(redirectTo);
          }
        } catch (err) {
          setFailure({
            error: err,
            fields: ['email', 'password', 'consent', 'termsAccepted'],
            fallback: 'registrationFailed',
          });
        }
        return;
      }

      const invalid = showFieldErrors({
        email: validateLoginEmail(email),
        password: validateLoginPassword(password),
        captcha: showCaptcha && !captcha.trim() ? 'captchaEmpty' : null,
      });
      if (invalid) {
        return;
      }

      try {
        const done = await run('submit', () =>
          onLogin({ email: email.trim(), password, captcha: showCaptcha ? captcha.trim() : undefined }),
        );
        if (!done) {
          return;
        }
        await onAuthenticated(redirectTo);
        setShowCaptcha(false);
        setCaptcha('');
        setCaptchaImageUrl(null);
      } catch (err) {
        const loginFields: AuthField[] = ['email', 'password', 'captcha'];
        if (err instanceof ApiRequestError && isNeedCaptchaEnvelope(err.envelope)) {
          setShowCaptcha(true);
          setCaptcha('');
          try {
            const url = await loadCaptchaUrl();
            setCaptchaImageUrl(url);
          } catch {
            setCaptchaImageUrl(null);
          }
          setFailure({ error: err, fields: loginFields, fallback: 'captchaDemanded' });
          return;
        }
        setFailure({ error: err, fields: loginFields, fallback: 'loginFailed' });
      }
    },
    [
      activeTab,
      captcha,
      confirmPassword,
      consent,
      termsAccepted,
      email,
      loadCaptchaUrl,
      onAuthenticated,
      onLogin,
      onRegister,
      password,
      redirectTo,
      resetErrors,
      run,
      showCaptcha,
      showFieldErrors,
    ],
  );

  // The texts in the current language, rebuilt on every render — a language switch included
  const server = serverFailureTexts(failure, t);
  const errorOf = (field: AuthField): Nullable<string> => {
    const error = fieldErrors[field];
    return error ? authErrorText(error, t) : (server.byField[field] ?? null);
  };

  return (
    <AuthPage
      t={t}
      activeTab={activeTab}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      consent={consent}
      termsAccepted={termsAccepted}
      captcha={captcha}
      captchaImageUrl={captchaImageUrl}
      showCaptcha={showCaptcha}
      emailError={errorOf('email')}
      passwordError={errorOf('password')}
      confirmPasswordError={errorOf('confirmPassword')}
      consentError={errorOf('consent')}
      termsError={errorOf('termsAccepted')}
      captchaError={errorOf('captcha')}
      formError={server.form}
      locked={busy}
      submitProgress={progressOf('submit')}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onConsentChange={setConsent}
      onTermsChange={setTermsAccepted}
      onCaptchaChange={setCaptcha}
      onSubmit={handleSubmit}
      redirectSearch={redirectSearch}
    />
  );
};

export default AuthPageLogicLayer;
