import { Link } from '@tanstack/react-router';
import { LogIn, UserPlus } from 'lucide-react';
import type { ReactNode } from 'react';
import { FC, FormEvent } from 'react';

import { BrandWordmark, Button } from '@shared';

import classes from 'src/pages/auth/ui/auth-page.module.scss';

export type AuthTab = 'login' | 'register';

type Props = {
  activeTab: AuthTab;
  email: string;
  password: string;
  captcha: string;
  captchaImageUrl: string | null;
  showCaptcha: boolean;
  emailError: string | null;
  passwordError: string | null;
  captchaError: string | null;
  formError: string | null;
  isSubmitting: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onCaptchaChange: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  redirectSearch: Record<string, string | undefined>;
};

const TabLink: FC<{
  to: '/login' | '/register';
  active: boolean;
  children: ReactNode;
  icon: ReactNode;
  search: Record<string, string | undefined>;
}> = ({ to, active, children, icon, search }) => (
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
  activeTab,
  email,
  password,
  captcha,
  captchaImageUrl,
  showCaptcha,
  emailError,
  passwordError,
  captchaError,
  formError,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onCaptchaChange,
  onSubmit,
  redirectSearch,
}) => {
  return (
    <div className={classes.page}>
      <div className={classes.card}>
        <header className={classes.header}>
          <BrandWordmark title="Set Forge" titleAs="h1" className={classes.wordmark} />
          <p className={classes.subtitle}>Sign in to sync workouts across devices</p>
        </header>

        <div className={classes.tabs} role="tablist" aria-label="Authentication">
          <TabLink
            to="/login"
            active={activeTab === 'login'}
            search={redirectSearch}
            icon={<LogIn size={18} strokeWidth={1.75} aria-hidden />}
          >
            Log in
          </TabLink>
          <TabLink
            to="/register"
            active={activeTab === 'register'}
            search={redirectSearch}
            icon={<UserPlus size={18} strokeWidth={1.75} aria-hidden />}
          >
            Register
          </TabLink>
        </div>

        <form className={classes.form} onSubmit={onSubmit} noValidate>
          <label className={classes.label} htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            className={classes.input}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e): void => onEmailChange(e.target.value)}
            disabled={isSubmitting}
          />
          {emailError && <p className={classes.fieldError}>{emailError}</p>}

          <label className={classes.label} htmlFor="auth-password">
            Password
          </label>
          <input
            id="auth-password"
            className={classes.input}
            type="password"
            autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e): void => onPasswordChange(e.target.value)}
            disabled={isSubmitting}
          />
          {passwordError && <p className={classes.fieldError}>{passwordError}</p>}

          {showCaptcha && (
            <>
              <p className={classes.captchaHint}>Enter the characters from the image (session protected login).</p>
              {captchaImageUrl && (
                <img src={captchaImageUrl} alt="Captcha" className={classes.captchaImg} width={200} height={60} />
              )}
              <label className={classes.label} htmlFor="auth-captcha">
                Captcha
              </label>
              <input
                id="auth-captcha"
                className={classes.input}
                type="text"
                autoComplete="off"
                value={captcha}
                onChange={(e): void => onCaptchaChange(e.target.value)}
                disabled={isSubmitting}
              />
              {captchaError && <p className={classes.fieldError}>{captchaError}</p>}
            </>
          )}

          {formError && <p className={classes.formError}>{formError}</p>}

          <Button type="submit" size="lg" disabled={isSubmitting} className={classes.submit}>
            {activeTab === 'login' ? 'Log in' : 'Create account'}
          </Button>
        </form>

        <p className={classes.legal}>
          <Link to="/privacy" className={classes.legalLink}>
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
