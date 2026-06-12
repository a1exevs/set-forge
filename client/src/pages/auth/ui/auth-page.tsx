import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { FC, FormEvent } from 'react';

import { Button } from '@shared';

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

const IconLogin: FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 11c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v2c0 1.66 1.34 3 3 3z"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <path
      d="M5 20v-1c0-2.76 2.24-5 5-5h4c2.76 0 5 2.24 5 5v1"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

const IconRegister: FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <circle cx="9" cy="7" r="3.25" stroke="currentColor" strokeWidth="1.75" />
    <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
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
          <h1 className={classes.title}>Set Forge</h1>
          <p className={classes.subtitle}>Sign in to sync workouts across devices</p>
        </header>

        <div className={classes.tabs} role="tablist" aria-label="Authentication">
          <TabLink to="/login" active={activeTab === 'login'} search={redirectSearch} icon={<IconLogin />}>
            Log in
          </TabLink>
          <TabLink to="/register" active={activeTab === 'register'} search={redirectSearch} icon={<IconRegister />}>
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
      </div>
    </div>
  );
};

export default AuthPage;
