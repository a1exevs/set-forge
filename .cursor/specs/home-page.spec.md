# Specification: Home Page

## Overview

The home page displays a list of workout lists, allows navigation to create a new one or to workout mode, and to edit or delete a list via dot-dot-dot menu. The page requires an authenticated session (see [auth-session.spec.md](auth-session.spec.md)).

---

## App header (authenticated)

1. Top **header** row (`.headerTop`): **left** — circular **user avatar** (placeholder for future image). Inside the circle: **first letter of the email local-part** in uppercase (text before `@`; if empty, use `?`).
2. **Center** — title block «Set Forge» / subtitle «Track your workout progress» (`.headerTitles`, absolutely centered).
3. **Right** — `.headerActions` with two icon-only buttons (`margin-left: auto`):
   - **Export workout lists** — `title` + `aria-label`; calls `onExport()`; **disabled** when `workoutLists.length === 0`.
   - **Import workout lists** — `title` + `aria-label`; opens hidden `<input type="file" accept=".json,application/json">` via `onImportClick()`; file passed to `onImportFile(file)`.
4. Avatar is the trigger for **Headless UI `Menu`** (`UserAvatarMenu`, see [shared-components.spec.md](shared-components.spec.md)): menu item **Logout**.
5. **Logout**: `DELETE /auth/logout` via `useLogoutMutation` — on success clear access token, session query cache, navigate to `/login`.

---

## Current Logic

### Initialization

1. `HomePageDataLayer` mounts.
2. Subscribes to `useCurrentUserQuery(true)`, `useWorkoutListsQuery(Boolean(user))`, `useDeleteWorkoutListMutation()`, `useExportAllWorkoutListsMutation()`, `useImportWorkoutListsMutation()`, `useLogoutMutation()`.
3. Passes `workoutLists` (`data ?? []`), delete/export/import handlers, session props, and `onEdit` (navigate to `/edit/$id`) to LogicLayer.
4. `HomePageLogicLayer` creates `onDelete` (`handleDelete`), `onExport`, `onImportClick`, `onImportFile` from mutations + `useConfirm`, passes them to Presentation along with other data.

### Data loading

5. `useWorkoutListsQuery` runs when the session user exists (`enabled: Boolean(user)`).
6. Query calls `GET /workout-lists` (via `workout-list-api`) for the authenticated user.
7. Result is cached under `workoutQueryKeys.lists`. On error — exposed via query `error` / mutation `error`.

### Display

8. Empty list: render block «No workout lists yet» with hint.
9. Non-empty: render card grid. Each card is a `Link` to `/workout/$id`, containing name, badge with exercise count, description (if present), created/lastUsed dates, dot-dot-dot menu button (see [shared-components.spec.md](shared-components.spec.md)).

### Menu actions (Edit / Delete)

10. Dot-dot-dot menu in top right of each card. Items: Edit, Delete (in that order).
11. **Edit**: `onEdit(id)` → `navigate({ to: '/edit/$id', params: { id } })`.
12. **Delete**: `onDelete(id, name)` → `handleDelete` opens confirm dialog via `useConfirm()` with title/description.
13. On confirmation, `useDeleteWorkoutListMutation().mutateAsync(id)` is called (awaited).
14. Mutation on success: removes the list from `workoutQueryKeys.lists` cache and drops `workoutQueryKeys.detail(id)`.

### Import / Export (header actions)

15. **Export**: `onExport()` → `useExportAllWorkoutListsMutation().mutateAsync()` → `GET /workout-lists/export` → client downloads `set-forge-workout-lists-YYYY-MM-DD.json` via `downloadJsonFile` helper.
16. **Import click**: `onImportClick()` triggers hidden file input (`ref` in LogicLayer).
17. **Import file**: `onImportFile(file)` → read JSON → confirm dialog «Import N workout list(s)?» → `useImportWorkoutListsMutation().mutateAsync(body)` → `POST /workout-lists/import` → invalidate lists cache on success.
18. Import/parse error: confirm dialog with error message (no toaster yet).
19. See [workout-list-api.spec.md](workout-list-api.spec.md) for file format and server behaviour.

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
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void | Promise<void>;
  onExport: () => void | Promise<void>;
  onImportClick: () => void;
  onImportFile: (file: File) => void | Promise<void>;
  importInputRef: RefObject<HTMLInputElement>;
  formatDate: (date: string | null) => string;
  userEmail: string;
  avatarLetter: string;
  onLogout: () => void | Promise<void>;
};
```

### Props HomePageLogicLayer

```typescript
type Props = {
  workoutLists: WorkoutList[];
  deleteWorkoutList: (id: string) => Promise<void>;
  exportAllWorkoutLists: () => Promise<WorkoutListsExportFile>;
  importWorkoutLists: (file: WorkoutListsExportFile) => Promise<void>;
  onEdit: (id: string) => void;
  formatDate: (date: string | null) => string;
  userEmail: string;
  avatarLetter: string;
  onLogout: () => void | Promise<void>;
};
```

### Relationships

- `workoutLists` — from `useWorkoutListsQuery(Boolean(user))`, populated by `GET /workout-lists`
- `formatDate` — from `@shared` (`src/shared/model/helpers/dates.ts`): `date => date ? new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Never'`
- `avatarLetter` — from `emailToAvatarLetter(user.email)` in data layer
- `userEmail` / `onLogout` — from session query and logout mutation

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Routing | TanStack Router (`Link`, `to`, `useNavigate`) |
| Server state | `@tanstack/react-query` (`useWorkoutListsQuery`, `useDeleteWorkoutListMutation`, `useExportAllWorkoutListsMutation`, `useImportWorkoutListsMutation`, session hooks) |
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
| `useWorkoutListsQuery(enabled)` | hook | List of workout lists (`GET /workout-lists`) |
| `useDeleteWorkoutListMutation()` | hook | Delete list (`DELETE /workout-lists/:id`) |
| `useExportAllWorkoutListsMutation()` | hook | Export all lists (`GET /workout-lists/export`) |
| `useImportWorkoutListsMutation()` | hook | Import file (`POST /workout-lists/import`) |
| `useCurrentUserQuery(enabled)` | hook | Current session user |
| `useLogoutMutation()` | hook | Logout + cache clear + redirect |
| `workoutQueryKeys.lists` | query key | Lists cache key |
| `formatDate(date)` | function | Date formatting |
| `useConfirm()` | hook | Open confirm dialog |
| Routes | — | `/` (home), `/create`, `/edit/$id`, `/workout/$id`, `/login`, `/register` (public) |

### Page public exports

- `HomePage` — exported as `default` from `home-page-data-layer.tsx` (router entry point).

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| No lists for user | `GET /workout-lists` returns `[]` |
| API error on lists query | Query enters error state; UI shows empty list until retry/refetch |
| `workoutLists.length === 0` | Render empty state, no cards |
| `list.description` empty | Description block not rendered |
| `list.lastUsedAt === null` | «Last used» string not displayed |
| Error on delete mutation | Mutation error; list remains in cache until refetch |
| Unauthenticated user | Protected route redirect handled in root `beforeLoad` |
| Export with no lists | Export button disabled |
| Import cancelled in confirm | No API call |
| Import invalid JSON | Error confirm; input value reset |
| Import API error | Error confirm; lists cache unchanged |
