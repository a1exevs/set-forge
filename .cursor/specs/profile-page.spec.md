# Specification: Profile Page

## Overview

The profile page shows the authenticated user's account info (avatar letter, email) and a **Log out** button. It shares the same bottom tab bar and swipe navigation as the Home page. Requires an authenticated session (see [auth-session.spec.md](auth-session.spec.md)).

---

## App header

1. Top **header** row (`.headerTop`): [`BrandWordmark`](shared-components.spec.md#brandwordmark) with `title="Profile"` (same layout as Home, no right-side actions).

---

## Account section

1. Centered [`UserAvatar`](shared-components.spec.md#useravatar) — display-only; letter from `emailToAvatarLetter(user.email)`.
2. Email text below avatar (`$text-secondary`).
3. **Log out** — `Button` (`variant="secondary"`) calling `useLogoutMutation().mutate()`; disabled while `isPending`.
4. **No** `UserAvatarMenu` dropdown; avatar is not clickable for logout.

---

## Bottom navigation and swipe

1. Fixed bottom [`MainTabsBar`](../../client/src/widgets/main-tabs-bar/) — Profile tab active on `/profile`.
2. `useTabSwipeNavigation({ tabs: MAIN_TAB_ROUTES, activePath })` on container:
   - Swipe **right** → History (`/history`).
   - Swipe **left** → no-op (Profile is the rightmost tab).

---

## Current Logic

### Initialization

1. `ProfilePageDataLayer` mounts.
2. Subscribes to `useCurrentUserQuery(true)` and `useLogoutMutation()`.
3. Passes `email`, `avatarLetter`, `onLogout`, `isLoggingOut` to LogicLayer → Presentation.

### Logout

4. **Log out** click → `logoutMutation.mutate()` → `DELETE /auth/logout` → clear session cache → redirect to `/login` (see [auth-session.spec.md](auth-session.spec.md)).

---

## Data Model

### Props ProfilePage (Presentation)

```typescript
type Props = {
  email: string;
  avatarLetter: string;
  onLogout: () => void | Promise<void>;
  isLoggingOut: boolean;
};
```

### Relationships

- `email` / `avatarLetter` — from `useCurrentUserQuery(true)` and `emailToAvatarLetter`
- Logout — `useLogoutMutation()` from `@entities`

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Routing | TanStack Router (`/profile`) |
| Server state | `@tanstack/react-query` (session hooks) |
| UI | `BrandWordmark`, `UserAvatar`, `Button`, `MainTabsBar` |
| Swipe | `useTabSwipeNavigation`, `MAIN_TAB_ROUTES` |

### Patterns

- 3-layer: Data → Logic → Presentation
- FSD: pages/profile, entities/session, shared, widgets

---

## Exposed API / Methods

| API | Type | Description |
|-----|-----|----------|
| `useCurrentUserQuery(true)` | hook | Current user email |
| `useLogoutMutation()` | hook | Logout + redirect |
| `emailToAvatarLetter(email)` | function | Avatar letter |
| `MAIN_TAB_ROUTES` | const | Tab order shared with Home |
| Route | — | `/profile` (protected) |

### Page public exports

- `ProfilePage` — exported as `default` from `profile-page-data-layer.tsx` (router entry point).

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| Unauthenticated user | Root `beforeLoad` redirects to `/login` |
| Logout in progress | Log out button disabled |
| Swipe right on Profile | Navigate to `/history` |
| Swipe left on Profile | No-op (rightmost tab) |

---

## References

- [home-page.spec.md](home-page.spec.md) — shared tabs bar and swipe
- [shared-components.spec.md](shared-components.spec.md) — `BrandWordmark`, `UserAvatar`, `TabsBar`
- [auth-session.spec.md](auth-session.spec.md) — logout flow
