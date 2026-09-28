import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import type { FormEvent } from 'react';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';
import { renderWithAuthRouter } from 'storybook-dir/render-with-page-router';

import AuthPage from './auth-page';

const meta = {
  title: 'Pages/AuthPage',
  component: AuthPage,
  decorators: [
    (Story, { args }): JSX.Element =>
      renderWithAuthRouter({
        initialEntries: [args.activeTab === 'register' ? '/register' : '/login'],
        component: (): JSX.Element => <Story />,
      }),
  ],
  args: {
    activeTab: 'login',
    email: '',
    password: '',
    consent: false,
    termsAccepted: false,
    captcha: '',
    captchaImageUrl: null,
    showCaptcha: false,
    emailError: null,
    passwordError: null,
    consentError: null,
    termsError: null,
    captchaError: null,
    formError: null,
    isSubmitting: false,
    onEmailChange: fn(),
    onPasswordChange: fn(),
    onConsentChange: fn(),
    onTermsChange: fn(),
    onCaptchaChange: fn(),
    onSubmit: fn((e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
    }),
    redirectSearch: {},
  },
} satisfies Meta<typeof AuthPage>;

export default meta;

type Story = StoryObj<typeof meta>;

const registerArgs: Story['args'] = { activeTab: 'register' };
const captchaArgs: Story['args'] = {
  activeTab: 'login',
  showCaptcha: true,
  captchaImageUrl: 'https://placehold.co/200x60/png?text=Captcha',
  formError: 'Please complete the captcha',
};

export const LoginDesktop4k = buildDesktop4KStoryObj<typeof meta>();
export const LoginDesktop = buildDesktopStoryObj<typeof meta>();
export const LoginTablet = buildTabletStoryObj<typeof meta>();
export const LoginMobile = buildMobileStoryObj<typeof meta>();

/** The register tab asks for consent and terms on top of the credentials. */
export const RegisterMobile = buildMobileStoryObj<typeof meta>({ args: registerArgs });

/** After too many attempts the server sends a captcha image and a form error. */
export const WithCaptchaMobile = buildMobileStoryObj<typeof meta>({ args: captchaArgs });
