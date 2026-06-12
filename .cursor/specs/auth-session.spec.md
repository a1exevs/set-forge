# Specification: Auth and session (API + routing)

## Overview

Client-side authentication aligned with Nest `auth` and `security` modules: registration and login forms, session bootstrap, protected routes, token refresh with single-flight mutex, and integration with TanStack Query.

---

## API contract (base URL)

- Base: same-origin `/api/1.0`.
- In production, Caddy serves HTTPS in front of `client-prod`; nginx in `client-prod` reverse-proxies `/api/` to `server-prod:5000`.
- In local Vite development, `/api` is proxied to `VITE_DEV_API_PROXY` from `client/.env.local`, or to `http://localhost:5001` by default.
- All browser requests use `credentials: 'include'` (session cookie `connect.sid`, httpOnly `refreshToken`).

### Envelope

Responses follow `CommonResponse`: `{ data, messages, fieldsErrors, resultCode }`. Success uses `resultCode === 0` (OK).

### Endpoints

| Method | Path | Body / notes |
|--------|------|----------------|
| POST | `/auth/registration` | `{ email, password }` — password length 8–50, valid email |
| POST | `/auth/login` | `{ email, password, captcha? }` |
| GET | `/security/get-captcha-url` | Sets session captcha; returns `{ captchaURL }` in `data` |
| POST | `/auth/refresh` | Cookie `refreshToken` only |
| GET | `/auth/me` | `Authorization: Bearer <access>` + refresh cookie |
| DELETE | `/auth/logout` | Bearer + refresh cookie |

### Login captcha (after failed attempts)

When `authFailedCount >= 5`, failed login responses use `resultCode === 10` (`NEED_CAPTCHA_AUTHORIZATION`). Client must call `GET /security/get-captcha-url`, show the image from absolute `data.captchaURL`, collect `captcha` text, and retry login including `captcha`.

---

## Routes

- **`/login`** and **`/register`**: same page component; active tab matches the path. Changing tab navigates to the other path.
- **Public**: `/login`, `/register` only.
- **Protected**: `/`, `/create`, `/edit/$id`, `/workout/$id` (all non-public routes).

### Redirects

- Unauthenticated user opens a protected URL → redirect to `/login` with optional `search.redirect` (intended URL).
- Authenticated user opens `/login` or `/register` → redirect to `/`.

---

## Session model

- **Access token**: stored in memory only (module); lost on full page reload — restored via `POST /auth/refresh` then `GET /auth/me` during root `beforeLoad`.
- **Current user**: `{ id, email }` from `/auth/me`; exposed via TanStack Query (`['session', 'me']`) and used for UI (avatar letter).

### Bootstrap (`beforeLoad` on root)

1. If access token missing → `POST /auth/refresh` with credentials.
2. If access token present → `GET /auth/me`.
3. If `me` returns 401 → one `refresh` attempt, then `me` again.
4. On final failure → treat as logged out (clear token).

### HTTP wrapper (authenticated)

- Adds `Authorization: Bearer` when a token exists.
- On **401** for a mutating or idempotent retry-safe request: await shared **refresh mutex**; on success update token and **retry once**; on failure clear session and redirect to `/login`.

---

## Auth page UI

- App title + subtitle.
- Headless UI `TabGroup`: Login / Register with decorative inline SVG icons; tab change updates route (`/login` | `/register`).
- Forms: email + password; register validates client-side per DTO (email format, password 8–50).
- Server errors: show `messages` / validation feedback; captcha path when `resultCode === 10`.
- Success: persist token, prefetch `me`, navigate to `/` or `redirect` search param.

---

## Tech stack

| Area | Choice |
|------|--------|
| Data fetching | Native `fetch` + small wrapper |
| Server state | `@tanstack/react-query` |
| Routing | TanStack Router `beforeLoad`, `redirect` |
| UI | Headless UI, SCSS modules, FSD (`pages/auth`, `entities/session`, `shared/api`) |

---

## References

- Backend DTOs: `server/src/auth/dto/`
- [home-page.spec.md](home-page.spec.md) — header avatar + logout
- [shared-components.spec.md](shared-components.spec.md) — `UserAvatarMenu`, auth tabs
