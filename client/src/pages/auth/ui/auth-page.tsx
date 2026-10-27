import { Link } from '@tanstack/react-router';
import { LogIn, UserPlus } from 'lucide-react';
import type { ReactNode } from 'react';
import { ChangeEvent, FC, FormEvent } from 'react';

import { type Progress, Trans, type Translate } from '@shared/lib';
import { BrandWordmark, Button, LanguageSelect, PasswordField } from '@shared/ui';
import { LegalFooter } from '@widgets/legal-footer';

import classes from './auth-page.module.scss';
import type { AuthTab } from '../model/auth-tab';

type Props = {
  t: Translate;
  activeTab: AuthTab;
  email: string;
  password: string;
  confirmPassword: string;
  consent: boolean;
  termsAccepted: boolean;
  captcha: string;
  captchaImageUrl: string | null;
  showCaptcha: boolean;
  emailError: string | null;
  passwordError: string | null;
  confirmPasswordError: string | null;
  consentError: string | null;
  termsError: string | null;
  captchaError: string | null;
  formError: string | null;
  /** A submit is in flight: the fields wait for its answer. */
  locked: boolean;
  submitProgress: Progress;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onConsentChange: (v: boolean) => void;
  onTermsChange: (v: boolean) => void;
  onCaptchaChange: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  redirectSearch: Record<string, string | undefined>;
};

type TabLinkProps = {
  to: '/login' | '/register';
  active: boolean;
  children: ReactNode;
  icon: ReactNode;
  search: Record<string, string | undefined>;
};

const TabLink: FC<TabLinkProps> = ({ to, active, children, icon, search }) => (
  <Link
    to={to}
    search={search}
    className={active ? `${classes.tab} ${classes.tabActive}` : classes.tab}
    aria-current={active ? 'page' : undefined}
  >
    <span className={classes.tabIcon} aria-hidden>
      {icon}
    </span>
    {children}
  </Link>
);

const AuthPage: FC<Props> = ({
  t,
  activeTab,
  email,
  password,
  confirmPassword,
  consent,
  termsAccepted,
  captcha,
  captchaImageUrl,
  showCaptcha,
  emailError,
  passwordError,
  confirmPasswordError,
  consentError,
  termsError,
  captchaError,
  formError,
  locked,
  submitProgress,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onConsentChange,
  onTermsChange,
  onCaptchaChange,
  onSubmit,
  redirectSearch,
}) => {
  const isRegister = activeTab === 'register';

  return (
    <div className={classes.page}>
      <div className={classes.card}>
        <header className={classes.header}>
          <BrandWordmark title="Set Forge" titleAs="h1" className={classes.wordmark} />
          <p className={classes.subtitle}>{t('auth.subtitle')}</p>
        </header>

        <div className={classes.tabs} role="tablist" aria-label={t('auth.tabs.label')}>
          <TabLink
            to="/login"
            active={activeTab === 'login'}
            search={redirectSearch}
            icon={<LogIn size={18} strokeWidth={1.75} aria-hidden />}
          >
            {t('auth.tabs.login')}
          </TabLink>
          <TabLink
            to="/register"
            active={activeTab === 'register'}
            search={redirectSearch}
            icon={<UserPlus size={18} strokeWidth={1.75} aria-hidden />}
          >
            {t('auth.tabs.register')}
          </TabLink>
        </div>

        <form className={classes.form} onSubmit={onSubmit} noValidate>
          <label className={classes.label} htmlFor="auth-email">
            {t('auth.email')}
          </label>
          <input
            id="auth-email"
            className={classes.input}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>): void => onEmailChange(e.target.value)}
            disabled={locked}
          />
          {emailError && <p className={classes.fieldError}>{emailError}</p>}

          <label className={classes.label} htmlFor="auth-password">
            {t('auth.password')}
          </label>
          <PasswordField
            showPasswordLabel={t('auth.showPassword')}
            hidePasswordLabel={t('auth.hidePassword')}
            id="auth-password"
            name="password"
            value={password}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            disabled={locked}
            revealable={!isRegister}
            onChange={onPasswordChange}
          />
          {passwordError && <p className={classes.fieldError}>{passwordError}</p>}

          {isRegister && (
            <>
              <label className={classes.label} htmlFor="auth-password-confirm">
                {t('auth.confirmPassword')}
              </label>
              <PasswordField
                showPasswordLabel={t('auth.showPassword')}
                hidePasswordLabel={t('auth.hidePassword')}
                id="auth-password-confirm"
                name="password-confirm"
                value={confirmPassword}
                autoComplete="new-password"
                disabled={locked}
                revealable={false}
                onChange={onConfirmPasswordChange}
              />
              {confirmPasswordError && <p className={classes.fieldError}>{confirmPasswordError}</p>}
            </>
          )}

          {showCaptcha && (
            <>
              <p className={classes.captchaHint}>{t('auth.captcha.hint')}</p>
              {captchaImageUrl && (
                <img
                  src={captchaImageUrl}
                  alt={t('auth.captcha.imageAlt')}
                  className={classes.captchaImg}
                  width={200}
                  height={60}
                />
              )}
              <label className={classes.label} htmlFor="auth-captcha">
                {t('auth.captcha.label')}
              </label>
              <input
                id="auth-captcha"
                className={classes.input}
                type="text"
                autoComplete="off"
                value={captcha}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => onCaptchaChange(e.target.value)}
                disabled={locked}
              />
              {captchaError && <p className={classes.fieldError}>{captchaError}</p>}
            </>
          )}

          {isRegister && (
            <>
              <label className={classes.consent}>
                {/** TODO implement shared chackbox via Headless UI and use it **/}
                <input
                  type="checkbox"
                  className={classes.consentCheckbox}
                  checked={consent}
                  onChange={(e: ChangeEvent<HTMLInputElement>): void => onConsentChange(e.target.checked)}
                  disabled={locked}
                />
                <span>
                  <Trans
                    t={t}
                    i18nKey="consent.personalData"
                    components={{
                      policy: (
                        <Link to="/privacy" className={classes.consentLink} target="_blank" rel="noopener noreferrer" />
                      ),
                    }}
                  />
                </span>
              </label>
              {consentError && <p className={classes.fieldError}>{consentError}</p>}

              <label className={classes.consent}>
                {/** TODO implement shared chackbox via Headless UI and use it **/}
                <input
                  type="checkbox"
                  className={classes.consentCheckbox}
                  checked={termsAccepted}
                  onChange={(e: ChangeEvent<HTMLInputElement>): void => onTermsChange(e.target.checked)}
                  disabled={locked}
                />
                <span>
                  <Trans
                    t={t}
                    i18nKey="consent.terms"
                    components={{
                      terms: (
                        <Link to="/terms" className={classes.consentLink} target="_blank" rel="noopener noreferrer" />
                      ),
                    }}
                  />
                </span>
              </label>
              {termsError && <p className={classes.fieldError}>{termsError}</p>}
            </>
          )}

          {formError && <p className={classes.formError}>{formError}</p>}

          <Button type="submit" size="lg" progress={submitProgress} className={classes.submit}>
            {isRegister ? t('auth.submit.register') : t('auth.submit.login')}
          </Button>
        </form>

        <div className={classes.footer}>
          <LegalFooter />
          <LanguageSelect variant="compact" ariaLabel={t('language.label')} />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
