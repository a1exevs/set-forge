# Session and account

Who the user is and what they agreed to: registration with separate consents, login (with a captcha after failed
attempts), a short-lived access token refreshed through an httpOnly cookie, route guards, re-acceptance of changed legal
documents, logout and account deletion. Legal duties behind this domain: `.cursor/rules/personal-data-compliance.mdc`.

## Glossary

- **Session** — the signed-in state on the client: an access token in memory plus the current user in the query cache.
- **Consent** — agreement to personal-data processing; **terms acceptance** — agreement to the Terms of Use. Two
  separate, explicit acts at registration.
- **Document versions** — the required Privacy Policy / Terms versions (server env); the user's accepted versions are
  stamped on acceptance.
- **Pending acceptance** — the user accepted an older version (or none, legacy users); derived, never stored.
- **Re-consent gate** — a blocking dialog: accept the current documents or log out.

## Invariants

| Invariant | Checked by |
|---|---|
| Email is unique | `server/src/auth/auth.service.spec.ts` |
| Registration requires `consent` and `termsAccepted`, both explicitly true, validated separately | `server/src/auth/dto/register.request.spec.ts` |
| Pending acceptance is derived from accepted vs required versions (up-to-date and legacy users tested) | `server/src/auth/auth.service.spec.ts` |
| Acceptance stamps the current versions and the time | `server/src/users/users.service.spec.ts` |
| The gate blocks app routes until accept or logout, and stays closed on `/privacy` and `/terms` | `client/src/widgets/document-reconsent/ui/specs/document-reconsent-gate.spec.unit.tsx` |
| Account deletion removes every user-owned row (DB cascade) | `server/test/e2e/account-deletion-cascade.e2e-spec.ts` |
| Concurrent token refreshes share one request | `client/src/shared/api/specs/refresh-access-token.spec.unit.ts` |
| After sign-in only an in-app `redirect` target is followed (no open redirect) | `client/src/pages/auth/lib/specs/resolve-redirect-target.spec.unit.ts` |
| Logout ends on `/login` also when the request fails | `client/src/features/logout/model/specs/use-logout.spec.unit.ts` |
| All workout data is scoped to the signed-in user | `server/src/workout-lists/workout-lists.service.spec.ts` · `server/src/workout-sessions/workout-sessions.service.spec.ts` |
| Guest-only (`/login`, `/register`), always-public (`/privacy`, `/terms`) and protected routes | ❌ review (route guard in `client/src/app/routes/__root.tsx`, no test) |
| Session hooks never navigate — the calling flow does | ❌ review |

## Flows

### Opening the app

The root route bootstraps the session before protected routes: refresh the access token, load the current user,
retry once; no user → clear every cached query and redirect to `/login?redirect=<path>`. Signed-in users are sent
home from the auth pages; the legal pages are open to everyone without a bootstrap.

### Sign in / register

A successful login or registration primes the current user and then follows the `redirect` target (a full page load)
or goes home. A login answered with "captcha required" shows a captcha image and retries with the code.

### Re-accepting documents

When the required versions go up, a signed-in user sees the gate on every app route: accepting stamps the new
versions, logging out ends the session.

### Logout and account deletion

Both clear every cached query and end on `/login`, also when the request fails. Deleting the account asks for
confirmation first.

## Map

| Part | Code |
|---|---|
| Client entity | `client/src/entities/session` |
| Token and refresh | `client/src/shared/api` |
| Route guards | `client/src/app/routes/__root.tsx` |
| Logout | `client/src/features/logout` |
| Screens | `client/src/pages/auth` · `client/src/pages/profile` · `client/src/pages/privacy` · `client/src/pages/terms` |
| Legal UI and gate | `client/src/widgets/legal-document` · `client/src/widgets/legal-footer` · `client/src/widgets/document-reconsent` |
| Server modules | `server/src/auth` · `server/src/users` · `server/src/roles` · `server/src/security` |
| Document versions | `server/src/common/constants/document-versions.ts` |
| HTTP contract | `server/src/auth/auth.controller.ts` (Swagger) |

## Related

- `.cursor/rules/personal-data-compliance.mdc` — what to update when personal data or the documents change.
