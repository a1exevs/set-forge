import { FC } from 'react';

import { useLoginMutation, useRegisterMutation } from 'src/entities/session/model/use-session-queries';
import type { AuthTab } from 'src/pages/auth/ui/auth-page';
import AuthPageLogicLayer from 'src/pages/auth/ui/auth-page-logic-layer';

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
