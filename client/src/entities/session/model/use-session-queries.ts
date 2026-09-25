import {
  useMutation,
  type UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { sessionQueryKeys } from './session-keys';
import {
  type AuthData,
  type CurrentUser,
  deleteAccount,
  deleteLogout,
  fetchCurrentUser,
  patchDocumentsAcceptance,
  postLogin,
  postRegistration,
} from '../api/session-api';

export function useCurrentUserQuery(enabled: boolean): UseQueryResult<CurrentUser | null> {
  return useQuery<CurrentUser | null>({
    queryKey: sessionQueryKeys.me,
    queryFn: fetchCurrentUser,
    enabled,
  });
}

type LoginVars = { email: string; password: string; captcha?: string; redirectTo?: string };
type RegisterVars = {
  email: string;
  password: string;
  consent: boolean;
  termsAccepted: boolean;
  redirectTo?: string;
};

export function useLoginMutation(): UseMutationResult<AuthData, Error, LoginVars> {
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: LoginVars) => {
      const { redirectTo: _r, ...rest } = vars;
      return postLogin(rest.email, rest.password, rest.captcha);
    },
    onSuccess: async (_data, vars) => {
      const user = await fetchCurrentUser();
      if (user) {
        qc.setQueryData(sessionQueryKeys.me, user);
      }
      const target =
        vars.redirectTo && vars.redirectTo.startsWith('/') && !vars.redirectTo.startsWith('//') ? vars.redirectTo : '/';
      if (target === '/') {
        await navigate({ to: '/' });
      } else {
        window.location.assign(`${window.location.origin}${target}`);
      }
    },
  });
}

export function useRegisterMutation(): UseMutationResult<AuthData, Error, RegisterVars> {
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: RegisterVars) => {
      const { redirectTo: _r, ...rest } = vars;
      return postRegistration(rest.email, rest.password, rest.consent, rest.termsAccepted);
    },
    onSuccess: async (_data, vars) => {
      const user = await fetchCurrentUser();
      if (user) {
        qc.setQueryData(sessionQueryKeys.me, user);
      }
      const target =
        vars.redirectTo && vars.redirectTo.startsWith('/') && !vars.redirectTo.startsWith('//') ? vars.redirectTo : '/';
      if (target === '/') {
        await navigate({ to: '/' });
      } else {
        window.location.assign(`${window.location.origin}${target}`);
      }
    },
  });
}

export function useLogoutMutation(): UseMutationResult<void, Error, void> {
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteLogout,
    onSettled: () => {
      qc.clear();
      void navigate({ to: '/login' });
    },
  });
}

export function useAcceptDocumentsMutation(): UseMutationResult<CurrentUser, Error, void> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: patchDocumentsAcceptance,
    onSuccess: user => {
      qc.setQueryData(sessionQueryKeys.me, user);
    },
  });
}

export function useDeleteAccountMutation(): UseMutationResult<void, Error, void> {
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteAccount,
    onSettled: () => {
      // The account is gone: drop every cached query (profile, workout lists, sessions, history).
      qc.clear();
      void navigate({ to: '/login' });
    },
  });
}
