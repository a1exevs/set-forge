# Session and account

Who the user is and what they agreed to: registration with separate consents, login (with a captcha after failed
attempts), a short-lived access token refreshed through an httpOnly cookie, route guards, re-acceptance of changed legal
documents, logout and account deletion. Legal duties behind this domain: `.claude/rules/personal-data-compliance.md`.

## Glossary

- **Auth session** — the signed-in state on the client: an access token in memory plus the current user in the query
  cache.
- **Bootstrap** — verifying the auth session when no user is cached (an app open, or after the session-expired
  handler cleared the cache): refresh the access token and load the current user.
- **Consent** — agreement to personal-data processing; **terms acceptance** — agreement to the Terms of Use. Two
  separate, explicit acts at registration.
- **Document versions** — the required Privacy Policy / Terms versions (server env); the user's accepted versions are
  stamped on acceptance.
- **Pending acceptance** — the user accepted an older version (or none, legacy users); derived, never stored.
- **Re-consent gate** — a blocking dialog: accept the current documents or log out.
- **Interface language** — the language of the interface on this device (English or Russian); a device preference,
  not account data.

## Invariants

Each id is proven by the tests tagged `// @invariant session/<id>`; `npm run lint:root` checks them.

| Id | Invariant |
|---|---|
| email-unique | Email is unique |
| separate-consent | Registration requires `consent` and `termsAccepted`, both explicitly true, validated separately |
| register-password-confirmed | Registration requires the password typed twice and both values equal; the confirmation never leaves the browser |
| pending-derived | Pending acceptance is derived from accepted vs required versions (legacy users included) |
| acceptance-stamps | Acceptance stamps the current versions and the time |
| reconsent-gate | The gate blocks app routes until accept or logout, and stays closed on `/privacy` and `/terms` |
| deletion-cascade | Account deletion removes every user-owned row (DB cascade) |
| refresh-single-flight | Concurrent token refreshes share one request |
| no-open-redirect | After sign-in only an in-app `redirect` target is followed (no open redirect) |
| captcha-counts-login-only | Only failed sign-ins lead to the captcha: after 5 in a session the login demands it, a wrong captcha keeps demanding it, a successful login starts over; a failed request elsewhere (an expired session) never counts |
| logout-ends-on-login | Logout ends on `/login` also when the request fails; account deletion ends there once the account is deleted or the session has already ended, and keeps the user signed in on any other failure |
| user-scoped | All workout data is scoped to the signed-in user |
| route-guards | Guest-only (`/login`, `/register`), always-public (`/privacy`, `/terms`) and protected routes |
| bootstrap-once | The auth session is verified once per app open; navigation between screens and link intent (hover, touch, focus) never request the current user again — a cleared refresh cookie is discovered by the next data request, a refresh token revoked on the server by the first refresh after the access token expires |
| hooks-dont-navigate | Auth session hooks never navigate — the calling flow does — ❌ review |
| server-errors-in-language | An error the server answers is shown in the chosen language by its code — under its field when the screen has it, else for the whole form or as a toast, and follows a language switch while it is on screen; a code the client does not know shows the server's English text |
| interface-language | The interface language is detected once, on the first open of the app on a device (a Russian browser → Russian, anything else → English), and kept on that device until the user changes it |

## Flows

### Opening the app

The root route bootstraps the auth session once per app open, on the first protected route, and retries once; no
user → clear every cached query and redirect to `/login?redirect=<path>`.
From then on every navigation reads the cached user and a screen starts loading its own data at once; hovering,
touching or focusing a link sends nothing. The next bootstrap happens on the next app open, or after the
session-expired handler cleared the cache. Signed-in users are sent home from the auth pages; the legal pages are open
to everyone without a bootstrap.

### Sign in / register

A successful login or registration primes the current user and then follows the `redirect` target (a full page load)
or goes home. A login answered with "captcha required" shows a captcha image and retries with the code. A rejected
login or registration shows the server's errors in the chosen language, each under its field when the form has it.

### Re-accepting documents

When the required versions go up, a signed-in user sees the gate on every app route: accepting stamps the new
versions, logging out ends the auth session.

### Choosing the language

The first open on a device takes the browser's first language (Russian → Russian, anything else → English) and keeps
it. From then on the choice changes only by hand — on Settings (from Profile), on the sign-in and register screens, or
on the privacy policy and terms — in one and the same control; the whole app follows at once and the device remembers
it. The legal documents open in the chosen language, also from the re-consent gate; their versions do not depend on
it.

### Logout and account deletion

Both clear every cached query and end on `/login` once the session has ended. Logout does so also when it fails: the
user wants out anyway. Deleting the account asks for confirmation and runs inside it; it ends on `/login` once the
account is deleted or the server answers that the session has already ended. Any other failure — a server error, a
lost connection — keeps the user signed in with the dialog open and says the account was not deleted, so a failure
never passes for success. While logout is in flight, deletion waits, and the other way round. Both
revoke the refresh token on the server and clear the refresh cookie, which every open tab shares: a request without
it is answered as unauthenticated — the same answer as for an expired access token — so another tab ends on `/login`
with its next data request, without waiting for its access token to expire. Logout succeeds whatever state the refresh
token is in — expired, damaged or already revoked: the cookie is cleared and the token's record, when the server can
tell which one it is, removed. A refresh with such a token is answered as unauthenticated.

## Map

| Part | Code |
|---|---|
| Client entity | `client/src/entities/session` |
| Token and refresh | `client/src/shared/api` |
| Route guards | `client/src/app/routes/__root.tsx` |
| Logout | `client/src/features/logout` |
| Screens | `client/src/pages/auth` · `client/src/pages/profile` · `client/src/pages/settings` · `client/src/pages/privacy` · `client/src/pages/terms` |
| Interface language | `client/src/shared/lib/i18n` · `client/src/shared/ui/language-select` · `client/src/app/i18n` |
| Legal UI and gate | `client/src/widgets/legal-document` · `client/src/widgets/legal-footer` · `client/src/widgets/document-reconsent` |
| Server modules | `server/src/auth` · `server/src/users` · `server/src/roles` · `server/src/security` |
| Models | `server/src/users/users.model.ts` · `server/src/users/users-roles.model.ts` · `server/src/roles/roles.model.ts` · `server/src/auth/refresh-tokens.model.ts` |
| Document versions | `server/src/common/constants/document-versions.ts` |
| HTTP contract | `server/src/auth/auth.controller.ts` (Swagger) |

## Related

- `.claude/rules/personal-data-compliance.md` — what to update when personal data or the documents change.
- `.claude/rules/i18n.md` — dictionaries, the `t` prop and the literal-text lint.
