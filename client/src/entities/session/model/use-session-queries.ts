import {
  useMutation,
  type UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';

import type { CurrentUser } from './current-user';
import { sessionQueryKeys } from './session-keys';
import {
  type AuthData,
  deleteAccount,
  deleteLogout,
  fetchCurrentUser,
  getCaptchaUrl,
  patchDocumentsAcceptance,
  postLogin,
  postRegistration,
} from '../api/session-api';

// Session mutations own the session cache only. Where the user goes next (home, redirect target, /login) is the
// caller's flow — see pages/auth, pages/profile and features/logout.

export function useCurrentUserQuery(enabled: boolean): UseQueryResult<CurrentUser | null> {
  return useQuery<CurrentUser | null>({
    queryKey: sessionQueryKeys.me,
    queryFn: fetchCurrentUser,
    enabled,
  });
}

type LoginVars = { email: string; password: string; captcha?: string };
type RegisterVars = {
  email: string;
  password: string;
  consent: boolean;
  termsAccepted: boolean;
};

export function useLoginMutation(): UseMutationResult<AuthData, Error, LoginVars> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password, captcha }: LoginVars) => postLogin(email, password, captcha),
    onSuccess: async () => {
      const user = await fetchCurrentUser();
      if (user) {
        qc.setQueryData(sessionQueryKeys.me, user);
      }
    },
  });
}

export function useRegisterMutation(): UseMutationResult<AuthData, Error, RegisterVars> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password, consent, termsAccepted }: RegisterVars) =>
      postRegistration(email, password, consent, termsAccepted),
    onSuccess: async () => {
      const user = await fetchCurrentUser();
      if (user) {
        qc.setQueryData(sessionQueryKeys.me, user);
      }
    },
  });
}

export function useLogoutMutation(): UseMutationResult<void, Error, void> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteLogout,
    onSettled: () => {
      qc.clear();
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
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteAccount,
    onSettled: () => {
      // The account is gone: drop every cached query (profile, workout lists, sessions, history).
      qc.clear();
    },
  });
}

/** Loads a fresh captcha image URL (after the server answered a login with "captcha required"). */
export function useCaptchaUrlMutation(): UseMutationResult<string, Error, void> {
  return useMutation({ mutationFn: getCaptchaUrl });
}
