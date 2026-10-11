/**
 * Where to go after signing in: the `redirect` search param when it is an in-app path, home otherwise.
 * `//host` is rejected — it would leave the app (open redirect).
 */
export const resolveRedirectTarget = (redirectTo: string | undefined): string =>
  redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/';
