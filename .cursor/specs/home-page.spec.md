# Specification: Home Page

## Overview

The home page displays a list of workout lists, allows navigation to create a new one or to workout mode, and to edit or delete a list via dot-dot-dot menu. It warns when storage is nearly full. The page requires an authenticated session (see [auth-session.spec.md](auth-session.spec.md)).

---

## App header (authenticated)

1. Top **header** row: **left** — circular **user avatar** (placeholder for future image). Inside the circle: **first letter of the email local-part** in uppercase (text before `@`; if empty, use `?`).
2. **Right** (or remaining header area): existing title block «Set Forge» / subtitle «Track your workout progress» (layout: avatar left, titles to the right of the avatar on the same row, consistent spacing).
3. Avatar is the trigger for **Headless UI `Menu`** (`UserAvatarMenu`, see [shared-components.spec.md](shared-components.spec.md)): menu item **Logout**.
4. **Logout**: `DELETE /auth/logout` via session API — on success clear access token, session query cache, navigate to `/login`.

---

## Current Logic

### Initialization

1. `HomePageDataLayer` mounts.
2. Subscribes to `useWorkoutListStore.use.workoutLists()`, `loadLists`, `deleteWorkoutList`. Passes `onEdit` (navigate to `/edit/$id`) and `deleteWorkoutList` to LogicLayer.
3. `HomePageLogicLayer` creates `onDelete` (`handleDelete`) from `deleteWorkoutList` and `useConfirm`, passes it to Presentation along with other data.

### Data loading

4. `HomePageLogicLayer` calls `loadLists()` on mount via `useEffect`.
5. `loadLists` in store calls `GET /workout-lists` (via `workout-list-api`) for the authenticated user.
6. Result is written to `state.workoutLists`. On error — to `state.error`.

### Storage usage check

7. Retired with the move to a backend API. There is no `localStorage` quota to monitor; `getUsagePercentageAsync` is stubbed to return `0` and `storageWarning` is always `false` (the warning UI path is removed). Server-side quota/limits are out of scope for this page.

### Display

10. Empty list: render block «No workout lists yet» with hint.
11. Non-empty: render card grid. Each card is a `Link` to `/workout/$id`, containing name, badge with exercise count, description (if present), created/lastUsed dates, dot-dot-dot menu button (see [shared-components.spec.md](shared-components.spec.md)).

### Menu actions (Edit / Delete)

12. Dot-dot-dot menu in top right of each card. Items: Edit, Delete (in that order).
13. **Edit**: `onEdit(id)` → `navigate({ to: '/edit/$id', params: { id } })`.
14. **Delete**: `onDelete(id, name)` → `handleDelete` opens confirm dialog via `useConfirm()` with title/description.
15. On confirmation, `deleteWorkoutList(id)` is called (awaited).
16. Store: `DELETE /workout-lists/:id`, then filter `workoutLists`, when `currentWorkout?.id === id` — `currentWorkout = null`.

---

## Data Model

### Types used

| Type | Source | Description |
|-----|----------|----------|
| `WorkoutList` | `@entities` | id, name, description, exercises[], createdAt, lastUsedAt |
| `WorkoutExercise` | `@entities` | id, name, muscleGroup, weight, reps, sets, completedSets |

### Props HomePage (Presentation)

```typescript
type Props = {
  workoutLists: WorkoutList[];
  storageWarning: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void | Promise<void>;
  formatDate: (date: string | null) => string;
  userEmail: string;
  onLogout: () => void | Promise<void>;
};
```

### Props HomePageLogicLayer

```typescript
type Props = {
  loadLists: () => Promise<void>;
  workoutLists: WorkoutList[];
  deleteWorkoutList: (id: string) => Promise<void>;
  onEdit: (id: string) => void;
  formatDate: (date: string | null) => string;
};
```

### Relationships

- `workoutLists` — from `useWorkoutListStore.use.workoutLists()`, populated by `loadLists()` (`GET /workout-lists`)
- `formatDate` — from `@shared` (`src/shared/model/helpers/dates.ts`): `date => date ? new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Never'`
- `storageWarning` is always `false` (storage-usage monitoring retired with the backend migration)

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Routing | TanStack Router (`Link`, `to`) |
| State | Zustand + Immer + DevTools, `createSelectors`; session user from `@entities` / TanStack Query |
| UI | React 18, FC, SCSS Modules, MenuButton (see [shared-components.spec.md](shared-components.spec.md)), UserAvatarMenu |
| Dialogs | `useConfirm` (ConfirmDialogProvider) |
| Persistence | Backend API `/api/1.0/workout-lists` via `workout-list-api` (see [workout-list-api.spec.md](workout-list-api.spec.md)) |

### Patterns

- 3-layer: Data → Logic → Presentation
- FSD: pages/home, entities/workout-list, shared
- Imports: `@entities`, `@shared`, absolute paths from `src/` for intra-layer

---

## Exposed API / Methods

### Do not break when extending

| API | Type | Description |
|-----|-----|----------|
| `useWorkoutListStore.use.workoutLists()` | selector | List of workout lists |
| `useWorkoutListStore.use.loadLists()` | action | Load lists from API (`GET /workout-lists`) |
| `useWorkoutListStore.use.deleteWorkoutList(id)` | action | Delete list (`DELETE /workout-lists/:id`) |
| `formatDate(date)` | function | Date formatting |
| `useConfirm()` | hook | Open confirm dialog |
| Routes | — | `/` (home), `/create`, `/edit/$id`, `/workout/$id`, `/login`, `/register` (public) |
| `userEmail` / `onLogout` | props | Passed from data layer from session query and logout mutation |

### Page public exports

- `HomePage` — exported as `default` from `home-page-data-layer.tsx` (router entry point).

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| No lists for user | `GET /workout-lists` returns `[]` |
| API error on `loadLists` | `state.error = 'Failed to load workout lists'`, `state.isLoading = false` |
| `workoutLists.length === 0` | Render empty state, no cards |
| `list.description` empty | Description block not rendered |
| `list.lastUsedAt === null` | «Last used» string not displayed |
| Error on `deleteWorkoutList` | `state.error` updated, list not removed from UI |
| Deleting currently open workout | `currentWorkout` cleared when `id === currentWorkout.id` |
