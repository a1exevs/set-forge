import { FC } from 'react';

import { useCaptchaUrlMutation, useLoginMutation, useRegisterMutation } from '@entities/session';

import AuthPageLogicLayer from './auth-page-logic-layer';
import type { LoginInput, RegisterInput } from '../model/auth-input';
import type { AuthTab } from '../model/auth-tab';
import { useRedirectAfterAuth } from '../model/use-redirect-after-auth';

type Props = {
  activeTab: AuthTab;
  redirectSearch: { redirect?: string };
};

const AuthPageDataLayer: FC<Props> = ({ activeTab, redirectSearch }) => {
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const captchaUrlMutation = useCaptchaUrlMutation();
  const redirectAfterAuth = useRedirectAfterAuth();

  return (
    <AuthPageLogicLayer
      activeTab={activeTab}
      redirectSearch={redirectSearch}
      onLogin={async (credentials: LoginInput): Promise<void> => {
        await loginMutation.mutateAsync(credentials);
      }}
      onRegister={async (registration: RegisterInput): Promise<void> => {
        await registerMutation.mutateAsync(registration);
      }}
      onAuthenticated={redirectAfterAuth}
      loadCaptchaUrl={async (): Promise<string> => captchaUrlMutation.mutateAsync()}
    />
  );
};

export default AuthPageDataLayer;
