import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import type { FormEvent } from 'react';

import { renderWithAuthRouter } from 'storybook-dir/render-with-page-router';

import AuthPage from 'src/pages/auth/ui/auth-page';

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
    captcha: '',
    captchaImageUrl: null,
    showCaptcha: false,
    emailError: null,
    passwordError: null,
    consentError: null,
    captchaError: null,
    formError: null,
    isSubmitting: false,
    onEmailChange: fn(),
    onPasswordChange: fn(),
    onConsentChange: fn(),
    onCaptchaChange: fn(),
    onSubmit: fn((e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
    }),
    redirectSearch: {},
  },
} satisfies Meta<typeof AuthPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoginTab: Story = {
  args: { activeTab: 'login' },
};

export const RegisterTab: Story = {
  args: { activeTab: 'register' },
};

export const WithCaptcha: Story = {
  args: {
    activeTab: 'login',
    showCaptcha: true,
    captchaImageUrl: 'https://placehold.co/200x60/png?text=Captcha',
    formError: 'Please complete the captcha',
  },
};
