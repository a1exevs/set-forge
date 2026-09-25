import { FC } from 'react';

import { useLoginMutation, useRegisterMutation } from '@entities/session';

import AuthPageLogicLayer from './auth-page-logic-layer';
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
      onLogin={async input => {
        await loginMutation.mutateAsync(input);
      }}
      onRegister={async input => {
        await registerMutation.mutateAsync(input);
      }}
    />
  );
};

export default AuthPageDataLayer;
