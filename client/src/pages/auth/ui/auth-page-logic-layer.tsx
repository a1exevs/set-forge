import { FC, FormEvent, useCallback, useState } from 'react';

import { getCaptchaUrl, isNeedCaptchaEnvelope } from 'src/entities/session/api/session-api';
import {
  validateLoginEmail,
  validateLoginPassword,
  validateRegisterEmail,
  validateRegisterPassword,
} from 'src/entities/session/model/auth-validation';
import type { AuthTab } from 'src/pages/auth/ui/auth-page';
import AuthPage from 'src/pages/auth/ui/auth-page';
import { ApiRequestError } from 'src/shared/api/http-client';

type Props = {
  activeTab: AuthTab;
  redirectSearch: Record<string, string | undefined>;
  isSubmitting: boolean;
  onLogin: (input: { email: string; password: string; captcha?: string; redirectTo?: string }) => Promise<void>;
  onRegister: (input: {
    email: string;
    password: string;
    consent: boolean;
    termsAccepted: boolean;
    redirectTo?: string;
  }) => Promise<void>;
};

const AuthPageLogicLayer: FC<Props> = ({ activeTab, redirectSearch, isSubmitting, onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [captchaImageUrl, setCaptchaImageUrl] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const redirectTo = typeof redirectSearch.redirect === 'string' ? redirectSearch.redirect : undefined;

  const resetFieldErrors = useCallback((): void => {
    setEmailError(null);
    setPasswordError(null);
    setConsentError(null);
    setTermsError(null);
    setCaptchaError(null);
    setFormError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      resetFieldErrors();

      if (activeTab === 'register') {
        const eErr = validateRegisterEmail(email);
        const pErr = validateRegisterPassword(password);
        const cErr = consent ? null : 'You must consent to the processing of your personal data';
        const tErr = termsAccepted ? null : 'You must accept the Terms of Use';
        setEmailError(eErr);
        setPasswordError(pErr);
        setConsentError(cErr);
        setTermsError(tErr);
        if (eErr || pErr || cErr || tErr) {
          return;
        }
        try {
          await onRegister({ email: email.trim(), password, consent, termsAccepted, redirectTo });
        } catch (err) {
          if (err instanceof ApiRequestError) {
            setFormError(err.envelope.messages.join(' ') || 'Registration failed');
          } else {
            setFormError('Something went wrong');
          }
        }
        return;
      }

      const eErr = validateLoginEmail(email);
      const pErr = validateLoginPassword(password);
      setEmailError(eErr);
      setPasswordError(pErr);
      if (eErr || pErr) {
        return;
      }
      if (showCaptcha) {
        if (!captcha.trim()) {
          setCaptchaError('Captcha is required');
          return;
        }
      }

      try {
        await onLogin({
          email: email.trim(),
          password,
          captcha: showCaptcha ? captcha.trim() : undefined,
          redirectTo,
        });
        setShowCaptcha(false);
        setCaptcha('');
        setCaptchaImageUrl(null);
      } catch (err) {
        if (err instanceof ApiRequestError) {
          if (isNeedCaptchaEnvelope(err.envelope)) {
            setShowCaptcha(true);
            setCaptcha('');
            try {
              const url = await getCaptchaUrl();
              setCaptchaImageUrl(url);
            } catch {
              setCaptchaImageUrl(null);
            }
            setFormError(err.envelope.messages.join(' ') || 'Captcha required');
            return;
          }
          setFormError(err.envelope.messages.join(' ') || 'Login failed');
          return;
        }
        setFormError('Something went wrong');
      }
    },
    [
      activeTab,
      captcha,
      consent,
      termsAccepted,
      email,
      onLogin,
      onRegister,
      password,
      redirectTo,
      resetFieldErrors,
      showCaptcha,
    ],
  );

  return (
    <AuthPage
      activeTab={activeTab}
      email={email}
      password={password}
      consent={consent}
      termsAccepted={termsAccepted}
      captcha={captcha}
      captchaImageUrl={captchaImageUrl}
      showCaptcha={showCaptcha}
      emailError={emailError}
      passwordError={passwordError}
      consentError={consentError}
      termsError={termsError}
      captchaError={captchaError}
      formError={formError}
      isSubmitting={isSubmitting}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConsentChange={setConsent}
      onTermsChange={setTermsAccepted}
      onCaptchaChange={setCaptcha}
      onSubmit={handleSubmit}
      redirectSearch={redirectSearch}
    />
  );
};

export default AuthPageLogicLayer;
