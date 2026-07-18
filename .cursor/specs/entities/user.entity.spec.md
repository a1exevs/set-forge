# Entity: User (auth & session)

## Overview

Authenticated user accounts, roles, and refresh tokens. The `auth` and `security` NestJS modules expose registration, login, logout, token refresh, and current-user endpoints. The client `entities/session` layer stores the access token in memory, bootstraps the session on route load, and exposes TanStack Query hooks.

Related entities: [workout-list](workout-list.entity.spec.md), [workout-session](workout-session.entity.spec.md).

Tables: `users`, `roles`, `users_roles`, `refreshTokens`.

---

## Database

### users

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | PK, auto-increment |
| `email` | STRING | unique, not null |
| `password` | STRING | hashed, not null |
| `accepted_terms_version` | INTEGER | nullable — Terms of Use version the user accepted |
| `accepted_privacy_version` | INTEGER | nullable — Privacy Policy version the user accepted |
| `accepted_at` | DATE | nullable — when the documents were accepted |

`@BelongsToMany(() => Role, () => UserRole)`.

Model: `server/src/users/users.model.ts`.
Migration (document-acceptance columns): `server/database/migrations/20260718120000-user-document-acceptance.js` — columns are nullable so legacy users are treated as "not yet accepted".

### roles

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | PK, auto-increment |
| `value` | STRING | unique, not null (e.g. `ADMIN`) |
| `description` | STRING | not null |

Model: `server/src/roles/roles.model.ts`.

### users_roles

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | PK, auto-increment |
| `user_id` | INTEGER | FK → `users.id` |
| `role_id` | INTEGER | FK → `roles.id` |

Junction table. Model: `server/src/users/users-roles.model.ts`.

### refreshTokens

| Column | Type | Notes |
|--------|------|-------|
| `uuid` | UUID | PK |
| `user_id` | INTEGER | FK → `users.id`, not null |
| `is_revoked` | BOOLEAN | default false |
| `expires` | DATE | not null |

Model: `server/src/auth/refresh-tokens.model.ts`.

---

## Invariants

- Email is unique across users.
- Refresh tokens are httpOnly cookies; access token is short-lived and held in client memory only.
- All workout and session APIs scope data to `request.user.id`.
- **Document acceptance / consent**: registration requires two separate, explicit acts of will — `consent` (personal-data processing, 152-ФЗ) and `termsAccepted` (Terms of Use); both must be `true` (`@Equals(true)`), validated at the boundary only and not persisted as flags. On registration the current document versions are stamped onto the user.
- **Re-acceptance**: a user must re-accept when a stored accepted version is `null` (legacy user) or lower than the current required version (`TERMS_VERSION` / `PRIVACY_VERSION` env, default `1`; read via `DocumentVersions`). `documentsPendingAcceptance` is derived, never stored.
- **Account deletion cascade**: deleting a user removes all user-owned data via DB-level `ON DELETE CASCADE` FKs (workout lists → exercises, workout sessions → session exercises, refresh tokens, users_roles). A single `where`-based `destroy` issues one DELETE so InnoDB applies the cascade.

---

## Server

### Location

- `server/src/auth/` — registration, login, logout, refresh, me
- `server/src/security/` — captcha URL
- `server/src/users/`, `server/src/roles/`

### Models

- `users.model.ts`, `users-roles.model.ts`, `roles.model.ts`, `refresh-tokens.model.ts`

### Module wiring

- `AuthModule`, `SecurityModule` registered in `AppModule`
- Swagger tags: `Docs.AUTHORIZATION_CONTROLLER`, `Docs.SECURITY_CONTROLLER`
- Route segments in `@common/constants/routes.ts`

---

## Client

### Location

`client/src/entities/session/` — `api/session-api.ts`, `model/use-session-queries.ts`, `model/session-keys.ts`, `model/avatar-letter.ts`, `model/auth-validation.ts`, `lib/bootstrap-session.ts`

Access token storage: `client/src/shared/api/access-token.store.ts` (via `@shared`, not in this entity folder).

### Types

```typescript
interface CurrentUser {
  id: number;
  email: string;
  documentsPendingAcceptance: boolean;
}
```

Query key: `sessionQueryKeys.me` → `['session', 'me']`.

---

## API contract

- Base: same-origin `/api/1.0`.
- In production, Caddy → `client-prod`; nginx proxies `/api/` to `server-prod:5000`.
- In Vite dev, `/api` proxies to `VITE_DEV_API_PROXY` or `http://localhost:5001`.
- Browser requests use `credentials: 'include'` (session cookie `connect.sid`, httpOnly `refreshToken`).
- Envelope: `CommonResponse` — `{ data, messages, fieldsErrors, resultCode }`; success `resultCode === 0`.

### Endpoints

| Method | Path | Body / notes |
|--------|------|----------------|
| POST | `/auth/registration` | `{ email, password, consent, termsAccepted }` — password 8–50, valid email; `consent` and `termsAccepted` must be `true` |
| POST | `/auth/login` | `{ email, password, captcha? }` |
| GET | `/security/get-captcha-url` | Sets session captcha; returns `{ captchaURL }` in `data` |
| POST | `/auth/refresh` | Cookie `refreshToken` only |
| GET | `/auth/me` | `Authorization: Bearer <access>` + refresh cookie → `{ id, email, documentsPendingAcceptance }` |
| PATCH | `/auth/documents-acceptance` | Bearer + refresh cookie — records acceptance of the current versions, returns updated `CurrentUser` |
| DELETE | `/auth/account` | Bearer + refresh cookie — deletes the account and all related data (cascade); clears the `refreshToken` cookie |
| DELETE | `/auth/logout` | Bearer + refresh cookie |

### Login captcha

When `authFailedCount >= 5`, failed login returns `resultCode === 10` (`NEED_CAPTCHA_AUTHORIZATION`). Client calls `GET /security/get-captcha-url`, shows captcha image, retries login with `captcha`.

### HTTP wrapper (authenticated requests)

- Adds `Authorization: Bearer` when token exists.
- On **401**: await shared refresh mutex; on success retry once; on failure clear session and redirect to `/login`.

---

## Exposed API / Methods

| API | Type | Description |
|-----|-----|-------------|
| `useCurrentUserQuery(enabled)` | hook | `GET /auth/me` → `CurrentUser` |
| `useLoginMutation()` | hook | `POST /auth/login` |
| `useRegisterMutation()` | hook | `POST /auth/registration` (`{ email, password, consent, termsAccepted }`) |
| `useAcceptDocumentsMutation()` | hook | `PATCH /auth/documents-acceptance`; updates `sessionQueryKeys.me` cache |
| `useDeleteAccountMutation()` | hook | `DELETE /auth/account`; clears the whole query cache and redirects to `/login` |
| `useLogoutMutation()` | hook | `DELETE /auth/logout` |
| `bootstrapSessionAndPrimeCache(queryClient)` | function | Root `beforeLoad` session bootstrap |
| `sessionQueryKeys.me` | query key | Current user cache |
| `emailToAvatarLetter(email)` | function | Avatar letter for profile |
| `fetchCurrentUser`, `postLogin`, `postRegistration`, `deleteLogout`, `patchDocumentsAcceptance`, `deleteAccount` | functions | Raw API calls (`session-api.ts`) |
| `getCaptchaUrl`, `isNeedCaptchaEnvelope`, `toAbsoluteFromApiOrigin` | functions | Captcha / envelope helpers |
| `validateLoginEmail`, `validateLoginPassword`, `validateRegisterEmail`, `validateRegisterPassword` | functions | Client-side form validation |

---

## Tests

- Unit: `server/src/auth/auth.controller.spec.ts`, `auth.service.spec.ts` (incl. `deleteAccount`, `acceptDocuments`, legacy-user `documentsPendingAcceptance`), `users/users.service.spec.ts` (`deleteUser`, `updateDocumentAcceptance`), DTO specs in `auth/dto/` and `users/dto/` (consent/terms validation)
- E2E: `server/test/e2e/account-deletion-cascade.e2e-spec.ts` (cascade removal), `server/test/e2e/user-workflow.e2e-spec.ts` (registration consent + `documentsPendingAcceptance`)
- Client: `entities/session/model/specs/avatar-letter.spec.unit.ts`; `widgets/document-reconsent/ui/specs/document-reconsent-gate.spec.unit.tsx`

---

## Used by

- [auth-page](../pages/auth-page.spec.md) — login/register UI, consent + terms checkboxes (API usage)
- [profile-page](../pages/profile-page.spec.md) — `GET /auth/me`, logout, delete account
- [privacy-page](../pages/privacy-page.spec.md) — Privacy Policy document
- [terms-page](../pages/terms-page.spec.md) — Terms of Use document
- [home-page](../pages/home-page.spec.md) — gates `useWorkoutListsQuery` on user
- [history-page](../pages/history-page.spec.md) — gates history query on user
- `widgets/document-reconsent` — blocking re-acceptance gate rendered at the root (`useAcceptDocumentsMutation`, `documentsPendingAcceptance`)
- All protected pages — root `beforeLoad` session bootstrap

---

## References

- Backend DTOs: `server/src/auth/dto/`, `server/src/users/dto/`
- Document versions: `server/src/common/constants/document-versions.ts` (`TERMS_VERSION` / `PRIVACY_VERSION`)
- Migration: `server/database/migrations/20260718120000-user-document-acceptance.js`
- [server-api.mdc](../../rules/server-api.mdc)
- [personal-data-compliance.mdc](../../rules/personal-data-compliance.mdc)
