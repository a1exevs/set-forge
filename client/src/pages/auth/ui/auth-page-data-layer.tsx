import { FC } from 'react';

import { useLoginMutation, useRegisterMutation } from '@entities/session';

import AuthPageLogicLayer from './auth-page-logic-layer';
import type { LoginInput, RegisterInput } from '../model/auth-input';
import type { AuthTab } from '../model/auth-tab';

type Props = {
  activeTab: AuthTab;
  redirectSearch: { redirect?: string };
};

const AuthPageDataLayer: FC<Props> = ({ activeTab, redirectSearch }) => {
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  return (
    <AuthPageLogicLayer
      activeTab={activeTab}
      redirectSearch={redirectSearch}
      isSubmitting={loginMutation.isPending || registerMutation.isPending}
      onLogin={async (input: LoginInput): Promise<void> => {
        await loginMutation.mutateAsync(input);
      }}
      onRegister={async (input: RegisterInput): Promise<void> => {
        await registerMutation.mutateAsync(input);
      }}
    />
  );
};

export default AuthPageDataLayer;
