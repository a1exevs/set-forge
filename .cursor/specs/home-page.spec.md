# Specification: Home Page

## Overview

The home page displays a list of workout lists, allows navigation to create a new one or to workout mode, and to edit or delete a list via dot-dot-dot menu. Bottom tabs link to Home and Profile. The page requires an authenticated session (see [auth-session.spec.md](auth-session.spec.md)).

---

## App header (authenticated)

1. Top **header** row (`.headerTop`): **left** — [`BrandWordmark`](shared-components.spec.md#brandwordmark) with `title="Workout lists"` (favicon + styled uppercase wordmark, same layout as Profile).
2. **Right** — `.headerActions` with two icon-only buttons (`justify-content: space-between` on `.headerTop`):
   - **Export workout lists** — lucide `Download`; `title` + `aria-label`; calls `onExport()`; **disabled** when `workoutLists.length === 0`.
   - **Import workout lists** — lucide `Upload`; `title` + `aria-label`; opens hidden `<input type="file" accept=".json,application/json">` via `onImportClick()`; file passed to `onImportFile(file)`.
3. **No account avatar / logout on the home header.** Logout is on the [Profile page](profile-page.spec.md).

---

## Bottom navigation and swipe

1. Fixed bottom [`MainTabsBar`](../../client/src/widgets/main-tabs-bar/) widget — Home (active on `/`) and Profile (`/profile`).
2. Container uses `useTabSwipeNavigation({ tabs: MAIN_TAB_ROUTES, activePath })` from `@shared`:
   - Swipe **left** → next tab (Profile) when not on rightmost tab.
   - Swipe **right** → previous tab when not on leftmost tab.
3. Tab order is defined once in `widgets/main-tabs-bar/model/main-tab-routes.ts` (`MAIN_TAB_ROUTES`).
4. `.container` and `.createFab` reserve space above the tabs bar (`3.5rem` + safe-area).

---

## Current Logic

### Initialization

1. `HomePageDataLayer` mounts.
2. Subscribes to `useCurrentUserQuery(true)`, `useWorkoutListsQuery(Boolean(user))`, `useDeleteWorkoutListMutation()`, `useExportAllWorkoutListsMutation()`, `useImportWorkoutListsMutation()`.
3. Passes `workoutLists` (`data ?? []`), delete/export/import handlers, and `onEdit` (navigate to `/edit/$id`) to LogicLayer.
4. `HomePageLogicLayer` creates `onDelete` (`handleDelete`), `onExport`, `onImportClick`, `onImportFile` from mutations + `useConfirm`, passes them to Presentation along with other data.
5. Presentation layer wires swipe navigation and `MainTabsBar` (no extra props through data/logic layers).

### Data loading

6. `useWorkoutListsQuery` runs when the session user exists (`enabled: Boolean(user)`).
7. Query calls `GET /workout-lists` (via `workout-list-api`) for the authenticated user.
8. Result is cached under `workoutQueryKeys.lists`. On error — exposed via query `error` / mutation `error`.

### Display

9. Empty list: render block «No workout lists yet» with hint.
10. Non-empty: render card grid. Each card is a `Link` to `/workout/$id`, containing name, badge with exercise count, description (if present), created/lastUsed dates, dot-dot-dot menu button (see [shared-components.spec.md](shared-components.spec.md)).

### Menu actions (Edit / Delete)

11. Dot-dot-dot menu in top right of each card. Items: Edit, Delete (in that order).
12. **Edit**: `onEdit(id)` → `navigate({ to: '/edit/$id', params: { id } })`.
13. **Delete**: `onDelete(id, name)` → `handleDelete` opens confirm dialog via `useConfirm()` with title/description.
14. On confirmation, `useDeleteWorkoutListMutation().mutateAsync(id)` is called (awaited).
15. Mutation on success: removes the list from `workoutQueryKeys.lists` cache and drops `workoutQueryKeys.detail(id)`.

### Import / Export (header actions)

16. **Export**: `onExport()` → `useExportAllWorkoutListsMutation().mutateAsync()` → `GET /workout-lists/export` → client downloads `set-forge-workout-lists-YYYY-MM-DD.json` via `downloadJsonFile` helper.
17. **Import click**: `onImportClick()` triggers hidden file input (`ref` in LogicLayer).
18. **Import file**: `onImportFile(file)` → read JSON → confirm dialog «Import N workout list(s)?» → `useImportWorkoutListsMutation().mutateAsync(body)` → `POST /workout-lists/import` → invalidate lists cache on success.
19. Import/parse error: confirm dialog with error message (no toaster yet).
20. See [workout-list-api.spec.md](workout-list-api.spec.md) for file format and server behaviour.

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
};
```

### Relationships

- `workoutLists` — from `useWorkoutListsQuery(Boolean(user))`, populated by `GET /workout-lists`
- `formatDate` — from `@shared` (`src/shared/model/helpers/dates.ts`)
- Session user query in DataLayer only gates `useWorkoutListsQuery`

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Routing | TanStack Router (`Link`, `to`, `useNavigate`, `useRouterState`) |
| Server state | `@tanstack/react-query` |
| UI | React 18, FC, SCSS Modules, lucide-react icons, `BrandWordmark`, `IconButton`, `MenuButton`, `MainTabsBar` |
| Swipe | `useTabSwipeNavigation`, `MAIN_TAB_ROUTES` |
| Dialogs | `useConfirm` (ConfirmDialogProvider) |
| Persistence | Backend API `/api/1.0/workout-lists` via `workout-list-api` |

### Patterns

- 3-layer: Data → Logic → Presentation
- FSD: pages/home, entities/workout-list, shared, widgets
- Imports: `@entities`, `@shared`, `@widgets`, absolute paths from `src/` for intra-layer

---

## Exposed API / Methods

### Do not break when extending

| API | Type | Description |
|-----|-----|----------|
| `useWorkoutListsQuery(enabled)` | hook | List of workout lists (`GET /workout-lists`) |
| `useDeleteWorkoutListMutation()` | hook | Delete list (`DELETE /workout-lists/:id`) |
| `useExportAllWorkoutListsMutation()` | hook | Export all lists (`GET /workout-lists/export`) |
| `useImportWorkoutListsMutation()` | hook | Import file (`POST /workout-lists/import`) |
| `useCurrentUserQuery(enabled)` | hook | Current session user (gates lists query on Home) |
| `useLogoutMutation()` | hook | Logout — used on Profile page, not Home |
| `workoutQueryKeys.lists` | query key | Lists cache key |
| `formatDate(date)` | function | Date formatting |
| `useConfirm()` | hook | Open confirm dialog |
| `MAIN_TAB_ROUTES` | const | Tab order for `MainTabsBar` and swipe |
| Routes | — | `/` (home), `/profile`, `/create`, `/edit/$id`, `/workout/$id`, `/login`, `/register` (public) |

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
| Swipe left on Home | Navigate to `/profile` |
| Swipe right on Home | No-op (leftmost tab) |
