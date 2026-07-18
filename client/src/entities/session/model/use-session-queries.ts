import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import type { CurrentUser } from 'src/entities/session/api/session-api';
import { deleteLogout, fetchCurrentUser, postLogin, postRegistration } from 'src/entities/session/api/session-api';
import { sessionQueryKeys } from 'src/entities/session/model/session-keys';

export function useCurrentUserQuery(enabled: boolean) {
  return useQuery<CurrentUser | null>({
    queryKey: sessionQueryKeys.me,
    queryFn: fetchCurrentUser,
    enabled,
  });
}

type LoginVars = { email: string; password: string; captcha?: string; redirectTo?: string };
type RegisterVars = { email: string; password: string; consent: boolean; redirectTo?: string };

export function useLoginMutation() {
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

export function useRegisterMutation() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: RegisterVars) => {
      const { redirectTo: _r, ...rest } = vars;
      return postRegistration(rest.email, rest.password, rest.consent);
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

export function useLogoutMutation() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteLogout,
    onSettled: () => {
      qc.removeQueries({ queryKey: sessionQueryKeys.me });
      void navigate({ to: '/login' });
    },
  });
}
