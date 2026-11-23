import { FC } from 'react';

import { type Captcha, useCaptchaMutation, useLoginMutation, useRegisterMutation } from '@entities/session';

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
  const captchaMutation = useCaptchaMutation();
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
      loadCaptcha={async (): Promise<Captcha> => captchaMutation.mutateAsync()}
    />
  );
};

export default AuthPageDataLayer;
