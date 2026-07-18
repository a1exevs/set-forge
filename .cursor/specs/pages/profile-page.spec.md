# Specification: Profile Page

## Overview

Shows authenticated user avatar letter, email, **Log out** button, and a **Delete account** danger zone. Shares bottom tab bar and swipe with Home and History. Session via [user entity](../entities/user.entity.spec.md).

---

## Route

- Path: `/profile` (protected)
- Router entry: `profile-page-data-layer.tsx`
- Route file: `client/src/app/model/routes/profile.tsx`

---

## Location

`client/src/pages/profile/`

---

## Files

- `ui/profile-page-data-layer.tsx`
- `ui/profile-page-logic-layer.tsx`
- `ui/profile-page.tsx`
- `ui/profile-page.module.scss`
- `ui/profile-page.stories.tsx`
- `ui/specs/profile-page.spec.unit.tsx`
- `ui/specs/profile-page.spec.snap.tsx`
- `ui/index.ts`, `index.ts`

---

## UI

### App header

1. [`BrandWordmark`](../shared/shared-components.spec.md#brandwordmark) with `title="Profile"` (no right actions).

### Account section

1. Centered [`UserAvatar`](../shared/shared-components.spec.md#useravatar) — display-only; letter from `emailToAvatarLetter`.
2. Email below avatar (`$text-secondary`).
3. **Log out** — [`Button`](../shared/shared-components.spec.md#button) `variant="secondary"`; disabled while `isLoggingOut`.
4. No `UserAvatarMenu` dropdown.

### Danger zone

1. Hint text warning that deletion is permanent and irreversible.
2. **Delete account** — [`Button`](../shared/shared-components.spec.md#button) `variant="danger"`; disabled while `isDeletingAccount`. Opens a confirm dialog before deleting.

### Legal footer

1. `Link`s to `/privacy` (Privacy Policy) and `/terms` (Terms of Service).

### Bottom navigation

1. [`MainTabsBar`](../../../client/src/widgets/main-tabs-bar/) — Profile tab active.

---

## Current Logic

### Initialization

1. `ProfilePageDataLayer`: `useCurrentUserQuery(true)`, `useLogoutMutation()`, `useDeleteAccountMutation()`.
2. Passes `email`, `avatarLetter`, `onLogout`, `isLoggingOut`, `onDeleteAccount`, `isDeletingAccount` to logic layer.

### Logout

3. Log out → `DELETE /auth/logout` → clear session cache → redirect `/login`.

### Delete account

4. Logic layer (`useConfirm`) shows a confirm dialog ("Delete account?"); on confirm → `onDeleteAccount()` → `DELETE /auth/account` → `useDeleteAccountMutation` clears the entire query cache and redirects to `/login`.

### Tab swipe (presentation)

5. `ProfilePage` mounts `useTabSwipeNavigation` — swipe right → `/history`; swipe left → no-op (rightmost tab).

---

## Data Model

### Props ProfilePage (Presentation)

```typescript
type Props = {
  email: string;
  avatarLetter: string;
  onLogout: () => void | Promise<void>;
  isLoggingOut: boolean;
  onDeleteAccount: () => void | Promise<void>;
  isDeletingAccount: boolean;
};
```

The confirm dialog lives in the logic layer (`useConfirm`), which wraps `onDeleteAccount` from the data layer.

---

## API usage

| Method | Path | Hook |
|--------|------|------|
| GET | `/auth/me` | `useCurrentUserQuery` |
| DELETE | `/auth/logout` | `useLogoutMutation` |
| DELETE | `/auth/account` | `useDeleteAccountMutation` |

Full contract: [user entity](../entities/user.entity.spec.md#api-contract).

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Routing | TanStack Router |
| Server state | `@tanstack/react-query` |
| UI | `BrandWordmark`, `UserAvatar`, `Button`, `MainTabsBar` |
| Swipe | `useTabSwipeNavigation`, `MAIN_TAB_ROUTES` |

---

## Exposed API / Methods

| API | Type | Description |
|-----|-----|-------------|
| `ProfilePage` | component | Default from `profile-page-data-layer.tsx` |

---

## Tests

- Unit: `ui/specs/profile-page.spec.unit.tsx`
- Snapshot: `ui/specs/profile-page.spec.snap.tsx`

---

## Storybook

- Title: `Pages/ProfilePage`
- File: `profile-page.stories.tsx`

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| Unauthenticated | Root redirect `/login` |
| Logout in progress | Button disabled |
| Delete in progress | Delete button disabled |
| Delete confirm cancelled | No request sent |
| Swipe right | Navigate to `/history` |

---

## References

- [user.entity.spec.md](../entities/user.entity.spec.md)
- [home-page.spec.md](home-page.spec.md)
- [shared-components.spec.md](../shared/shared-components.spec.md)
