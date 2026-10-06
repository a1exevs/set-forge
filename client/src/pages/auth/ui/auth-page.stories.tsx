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
    confirmPassword: '',
    consent: false,
    termsAccepted: false,
    captcha: '',
    captchaImageUrl: null,
    showCaptcha: false,
    emailError: null,
    passwordError: null,
    confirmPasswordError: null,
    consentError: null,
    termsError: null,
    captchaError: null,
    formError: null,
    isSubmitting: false,
    onEmailChange: fn(),
    onPasswordChange: fn(),
    onConfirmPasswordChange: fn(),
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
const registerMismatchArgs: Story['args'] = {
  activeTab: 'register',
  password: 'correct-horse',
  confirmPassword: 'correct-hrose',
  consent: true,
  termsAccepted: true,
  confirmPasswordError: 'Passwords do not match',
};
const captchaArgs: Story['args'] = {
  activeTab: 'login',
  showCaptcha: true,
  captchaImageUrl: 'https://placehold.co/200x60/png?text=Captcha',
  formError: 'Please complete the captcha',
};

/** The login tab, empty, at 4K. */
export const LoginDesktop4k = buildDesktop4KStoryObj<typeof meta>();
/** The login tab on a desktop screen. */
export const LoginDesktop = buildDesktopStoryObj<typeof meta>();
/** The login tab on a tablet. */
export const LoginTablet = buildTabletStoryObj<typeof meta>();
/** The login tab on a phone: the everyday form of the page. */
export const LoginMobile = buildMobileStoryObj<typeof meta>();

/** The register tab asks for the password twice, without a show / hide toggle, and for consent and terms. */
export const RegisterMobile = buildMobileStoryObj<typeof meta>({ args: registerArgs });

/** A typo in the confirmation stops the registration on submit. */
export const RegisterMismatchMobile = buildMobileStoryObj<typeof meta>({ args: registerMismatchArgs });

/** After too many attempts the server sends a captcha image and a form error. */
export const WithCaptchaMobile = buildMobileStoryObj<typeof meta>({ args: captchaArgs });
