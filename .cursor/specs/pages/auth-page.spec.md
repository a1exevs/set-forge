# Specification: Auth Page

## Overview

Login and registration on `/login` and `/register` (same component, tab follows path). Handles forms, captcha after failed logins, and post-auth navigation. Session bootstrap and protected-route redirects live in root `beforeLoad` ([user entity](../entities/user.entity.spec.md)).

---

## Route

- Paths: `/login`, `/register` (public)
- Router entry: `auth-page-data-layer.tsx` (same component for both routes)
- Route files: `client/src/app/model/routes/login.tsx`, `register.tsx`
- Protected routes (all others): `/`, `/history`, `/profile`, `/create`, `/edit/$id`, `/workout/$id`

### Redirects

- Unauthenticated → protected URL → `/login` with `search.redirect`
- Authenticated → `/login` or `/register` → `/`

---

## Location

`client/src/pages/auth/`

---

## Files

- `ui/auth-page-data-layer.tsx`
- `ui/auth-page-logic-layer.tsx`
- `ui/auth-page.tsx`
- `ui/auth-page.module.scss`
- `ui/auth-page.stories.tsx`
- `ui/index.ts`, `index.ts`

---

## UI

### Main content

1. Centered [`BrandWordmark`](../shared/shared-components.spec.md#brandwordmark) (`title="Set Forge"`, `titleAs="h1"`) + subtitle.
2. TanStack Router `Link` tab links: Login / Register (`LogIn` / `UserPlus` icons); `role="tablist"` on nav.
3. Forms: email + password fields; optional captcha image + input when visible.
4. Server errors: `messages` / field errors on form.

---

## Current Logic

### Initialization

1. `AuthPageDataLayer` receives `activeTab`, `redirectSearch`.
2. `useLoginMutation`, `useRegisterMutation` passed to logic layer.

### Submit

3. Login/register → mutation → on success persist token, prefetch `me`, navigate to `/` or `redirect` search param.
4. Tab change navigates between `/login` and `/register`.
5. Register: client-side email/password validation (`validateRegisterEmail`, `validateRegisterPassword`) before submit.
6. Login: client-side email/password validation (`validateLoginEmail`, `validateLoginPassword`) before submit.
7. Failed login with captcha requirement (`resultCode === 10`) → fetch captcha URL, show image, retry with `captcha` field.

### Session bootstrap (root, not this page)

8. `bootstrapSessionAndPrimeCache` in `__root.tsx` `beforeLoad`: refresh → me; 401 retry once.

---

## Data Model

### Props AuthPage (Presentation)

Controlled form fields: `activeTab`, `email`, `password`, `captcha`, `captchaImageUrl`, `showCaptcha`, field errors, `isSubmitting`, handlers.

---

## API usage

| Method | Path | Hook / flow |
|--------|------|-------------|
| POST | `/auth/login` | `useLoginMutation` |
| POST | `/auth/registration` | `useRegisterMutation` |
| GET | `/security/get-captcha-url` | logic layer on captcha required |
| POST | `/auth/refresh` | root bootstrap (not this page) |
| GET | `/auth/me` | root bootstrap |

Full contract: [user entity](../entities/user.entity.spec.md#api-contract).

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Routing | TanStack Router `beforeLoad`, `redirect` |
| Server state | `@tanstack/react-query` |
| UI | TanStack Router `Link`, SCSS modules |
| FSD | `pages/auth`, `entities/session` |

---

## Exposed API / Methods

| API | Type | Description |
|-----|-----|-------------|
| `AuthPage` | component | Via data layer from login/register routes |
| `AuthTab` | type | `'login' \| 'register'` |

---

## Tests

- Storybook only for page-level UI

---

## Storybook

- Title: `Pages/AuthPage`
- File: `auth-page.stories.tsx`
- Decorator: `renderWithAuthRouter` for `/login` and `/register`

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| Already logged in on `/login` | Root redirect to `/` |
| Captcha required | Show image + captcha field |
| Invalid credentials | Form error messages |
| `redirect` search param | Navigate there after success |

---

## References

- [user.entity.spec.md](../entities/user.entity.spec.md)
- [home-page.spec.md](home-page.spec.md)
- [shared-components.spec.md](../shared/shared-components.spec.md)
