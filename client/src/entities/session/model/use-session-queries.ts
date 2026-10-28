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

// Session mutations own the session cache only; where the user goes next is the caller's flow
// (session/hooks-dont-navigate).

export function useCurrentUserQuery(enabled: boolean): UseQueryResult<CurrentUser | null> {
  return useQuery<CurrentUser | null>({
    queryKey: sessionQueryKeys.me,
    queryFn: fetchCurrentUser,
    enabled,
    // session/bootstrap-once: fresh for the life of the app — a session that ended is found by the next data request,
    // not by refetching this one.
    staleTime: Infinity,
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

// Logout and account deletion leave the cache to `useClearSessionCache`: the caller decides when the data goes.
export function useLogoutMutation(): UseMutationResult<void, Error, void> {
  return useMutation({ mutationFn: deleteLogout });
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
  return useMutation({ mutationFn: deleteAccount });
}

/** Drops every cached query once the session has ended on this device. */
export function useClearSessionCache(): () => void {
  const qc = useQueryClient();

  return (): void => qc.clear();
}

/** Loads a fresh captcha image URL (after the server answered a login with "captcha required"). */
export function useCaptchaUrlMutation(): UseMutationResult<string, Error, void> {
  return useMutation({ mutationFn: getCaptchaUrl });
}
