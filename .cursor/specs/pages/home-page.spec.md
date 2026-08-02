# Specification: Home Page

## Overview

The home page displays workout lists, supports create/edit/delete via card menu, and import/export via header actions. Bottom tabs link Home, History, and Profile. Requires authenticated session ([user entity](../entities/user.entity.spec.md)).

Entity: [workout-list](../entities/workout-list.entity.spec.md). Related pages: [create-workout-page](create-workout-page.spec.md), [profile-page](profile-page.spec.md), [history-page](history-page.spec.md).

---

## Route

- Path: `/` (protected)
- Router entry: `default` export from `home-page-data-layer.tsx`
- Route file: `client/src/app/model/routes/index.tsx`

---

## Location

`client/src/pages/home/`

---

## Files

- `ui/home-page-data-layer.tsx` — data layer
- `ui/home-page-logic-layer.tsx` — logic layer
- `ui/home-page.tsx` — presentation
- `ui/home-page.module.scss`
- `ui/home-page.stories.tsx`
- `ui/index.ts`, `index.ts`

---

## UI

### App header

1. `.headerTop`: [`BrandWordmark`](../shared/shared-components.spec.md#brandwordmark) with `title="Workout lists"`.
2. `.headerActions` (right): **Export** (`Download` [`IconButton`](../shared/shared-components.spec.md#iconbutton)) — disabled when `workoutLists.length === 0`; **Import** (`Upload`) — triggers hidden file input.
3. No avatar/logout on home header (see [profile-page](profile-page.spec.md)).

### Main content

1. Empty: «No workout lists yet» with hint.
2. Non-empty: card grid; each card `Link` to `/workout/$id` with name, exercise-count badge, description (if any), dates, [`MenuButton`](../shared/shared-components.spec.md#menubutton) (Edit, Delete).
3. Fixed **Create** FAB (`IconButton` primary circle `lg`) → `/create`.

### Bottom navigation

1. [`MainTabsBar`](../../../client/src/widgets/main-tabs-bar/) — Home tab active.
2. Root container reserves space above tabs (`3.5rem` + safe-area inset).

---

## Current Logic

### Initialization

1. `HomePageDataLayer` mounts.
2. `useCurrentUserQuery(true)`, `useWorkoutListsQuery(Boolean(user))`, delete/export/import mutations.
3. Logic layer builds delete/export/import handlers with `useConfirm`.

### Tab swipe (presentation)

4. `HomePage` mounts `useTabSwipeNavigation({ tabs: MAIN_TAB_ROUTES, activePath })` on root container — swipe left → `/history`; swipe right → no-op.

### Data loading

5. `useWorkoutListsQuery` enabled when user exists; cache `workoutQueryKeys.lists`.

### Menu actions

6. **Edit** → `navigate({ to: '/edit/$id', params: { id } })`.
7. **Delete** → confirm → `deleteWorkoutList(id)` then `clearWorkoutSessionCachesForDeletedList(id)` in logic layer. List mutation updates list cache only; session cache helper clears `active`, `forList`, and `detail` for the removed list. Server discards any active session for that list (not saved to history).

### Import / Export

8. **Export** → `GET /workout-lists/export` → download `set-forge-workout-lists-YYYY-MM-DD.json`.
9. **Import** → read file → confirm → `POST /workout-lists/import`; errors via confirm dialog.

---

## Data Model

### Props HomePage (Presentation)

```typescript
type Props = {
  workoutLists: WorkoutList[];
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void | Promise<void>;
  onExport: () => void | Promise<void>;
  onImportClick: () => void;
  onImportFile: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
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

---

## API usage

| Method | Path | Hook |
|--------|------|------|
| GET | `/auth/me` | `useCurrentUserQuery` (gates lists query) |
| GET | `/workout-lists` | `useWorkoutListsQuery` |
| DELETE | `/workout-lists/:id` | `useDeleteWorkoutListMutation` |
| GET | `/workout-lists/export` | `useExportAllWorkoutListsMutation` |
| POST | `/workout-lists/import` | `useImportWorkoutListsMutation` |

Full contract: [workout-list entity](../entities/workout-list.entity.spec.md#api-contract).

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Routing | TanStack Router |
| Server state | `@tanstack/react-query` |
| UI | SCSS Modules, lucide-react, `BrandWordmark`, `IconButton`, `MenuButton`, `MainTabsBar` |
| Swipe | `useTabSwipeNavigation`, `MAIN_TAB_ROUTES` |
| Dialogs | `useConfirm` |

Patterns: 3-layer Data → Logic → Presentation; FSD `pages/home`, `entities/workout-list`, `widgets`.

---

## Exposed API / Methods

| API | Type | Description |
|-----|-----|-------------|
| `HomePage` | component | Default export of `home-page-data-layer.tsx` |

---

## Tests

- Storybook: `Pages/HomePage` — `home-page.stories.tsx`
- Unit: `pages/home/ui/specs/home-page-logic-layer.spec.unit.tsx` — delete confirms, list delete + session cache clear orchestration

---

## Storybook

- Title: `Pages/HomePage`
- File: `home-page.stories.tsx`
- Stories: default states with mock lists

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| No lists | Empty state; export disabled |
| API error on lists | Empty state (`workoutLists` defaults to `[]`; query `isError` not surfaced) |
| Import cancelled | No API call |
| Import invalid JSON | Error confirm; input reset |
| Swipe left on Home | Navigate to `/history` |
| Unauthenticated | Root `beforeLoad` → `/login` |

---

## References

- [workout-list.entity.spec.md](../entities/workout-list.entity.spec.md)
- [user.entity.spec.md](../entities/user.entity.spec.md)
- [shared-components.spec.md](../shared/shared-components.spec.md)
