# Specification: Home Page

## Overview

The home page displays a list of workout lists, allows navigation to create a new one or to workout mode, and to delete a list. It warns when storage is nearly full.

---

## Current Logic

### Initialization

1. `HomePageDataLayer` mounts.
2. Subscribes to `useWorkoutListStore.use.workoutLists()`, `loadFromStorage`, `deleteWorkoutList`, `getUsagePercentageAsync`.
3. Passes data to `HomePageLogicLayer`.

### Data loading

4. `HomePageLogicLayer` calls `loadFromStorage()` on mount via `useEffect`.
5. `loadFromStorage` in store reads `workoutListStorage.getAllLists()`, parses JSON from `localStorage` under key `workout-lists`.
6. Result is written to `state.workoutLists`. On error — to `state.error`.

### Storage usage check

7. In `useEffect` with dependencies `[workoutLists, getUsagePercentageAsync]`, `getUsagePercentageAsync()` is called.
8. If `navigator.storage.estimate` is available — `usage / quota * 100` is used. Otherwise — `calculateLocalStorageSize() / 5MB * 100`.
9. When `percentage >= 80`, `storageWarning = true` is set.

### Display

10. Empty list: render block «No workout lists yet» with hint.
11. Non-empty: render card grid. Each card is a `Link` to `/workout/$id`, containing name, badge with exercise count, description (if present), created/lastUsed dates, delete button.

### Deletion

12. Click on delete button triggers `onDelete(id, name)`.
13. `handleDelete` opens confirm dialog via `useConfirm()` with title/description.
14. On confirmation, `deleteWorkoutList(id)` is called.
15. Store: `workoutListStorage.deleteList(id)`, filter `workoutLists`, when `currentWorkout?.id === id` — `currentWorkout = null`.

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
  onDelete: (id: string, name: string) => void | Promise<void>;
  formatDate: (date: string | null) => string;
};
```

### Props HomePageLogicLayer

```typescript
type Props = {
  loadFromStorage: () => void;
  workoutLists: WorkoutList[];
  deleteWorkoutList: (id: string) => void;
  formatDate: (date: string | null) => string;
  getUsagePercentageAsync: () => Promise<number>;
};
```

### Relationships

- `workoutLists` — from `useWorkoutListStore.use.workoutLists()`
- `formatDate` — from `@shared` (`formatDate` from `dates.ts`): `date => date ? new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Never'`

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Routing | TanStack Router (`Link`, `to`) |
| State | Zustand + Immer + DevTools, `createSelectors` |
| UI | React 18, FC, SCSS Modules |
| Dialogs | `useConfirm` (ConfirmDialogProvider) |
| Storage | `workoutListStorage` (LocalStorage, key `workout-lists`) |

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
| `useWorkoutListStore.use.loadFromStorage()` | action | Load from storage |
| `useWorkoutListStore.use.deleteWorkoutList(id)` | action | Delete list |
| `workoutListStorage.getUsagePercentageAsync()` | method | Storage usage percentage |
| `formatDate(date)` | function | Date formatting |
| `useConfirm()` | hook | Open confirm dialog |
| Routes | — | `/` (home), `/create`, `/workout/$id` |

### Page public exports

- `HomePage` — exported as `default` from `home-page-data-layer.tsx` (router entry point).

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| Empty `localStorage` | `getStorageData()` returns `[]` |
| Invalid JSON in storage | `JSON.parse` in try/catch → fallback `[]` |
| Error on `loadFromStorage` | `state.error = 'Failed to load workout lists'`, `state.isLoading = false` |
| `workoutLists.length === 0` | Render empty state, no cards |
| `list.description` empty | Description block not rendered |
| `list.lastUsedAt === null` | «Last used» string not displayed |
| `navigator.storage.estimate` unavailable | Fallback to sync `getUsagePercentage()` |
| Error on `deleteWorkoutList` | `state.error` updated, list not removed from UI |
| Deleting currently open workout | `currentWorkout` cleared when `id === currentWorkout.id` |
