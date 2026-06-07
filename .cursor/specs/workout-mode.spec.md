# Specification: Workout Mode Page

## Overview

Page for running a workout from a selected workout list: display exercises, double-tap to mark a set, overall progress, reset progress. Data comes from TanStack Query (`useWorkoutQuery`).

---

## Current Logic

### Initialization

1. Route `/workout/$id` renders `WorkoutModeRoute`, which extracts `id` via `useParams({ from: '/workout/$id' })`.
2. `WorkoutModePageDataLayer` receives `id`, calls `useWorkoutQuery(id)`, `useUpdateWorkoutProgressMutation()`, `useResetWorkoutProgressMutation()`.
3. Passes `workout` to LogicLayer: `undefined` while loading, `null` when not found, `WorkoutList` when loaded.

### Workout loading

4. `useWorkoutQuery(id)`: calls `GET /workout-lists/:id` (via `workout-list-api`). When the list exists — cached under `workoutQueryKeys.detail(id)`.
5. On 404/not owned, query data is `null`.

### Display

6. `workout === undefined`: render nothing (loading).
7. `workout === null`: render `NotFoundMessage` widget (from `widgets/not-found-message`): «Workout list not found» + «Back to Home» link.
8. Otherwise: header with name, description, overall progress (completed/total exercises, %), list of exercise cards.

### Set marking (double-tap)

9. `handleTap(exerciseId)`:
   - `lastTapRef.current[exerciseId]` stores timestamp of last tap.
   - If `timeSinceLastTap < 300ms` and `> 0` — treat as double-tap → `handleExerciseClick(exerciseId)`.
   - Otherwise — update `lastTapRef.current[exerciseId] = now`.
10. `handleExerciseClick(exerciseId)`:
    - Finds exercise in `workout.exercises`.
    - If `completedSets < sets` → `updateWorkoutProgress(listId, exerciseId)`.
    - When `completedSets + 1 === sets` → `setJustCompleted(exerciseId)`, reset after 1s.

### Progress update (mutation)

11. `useUpdateWorkoutProgressMutation()` (async, optimistic):
    - `onMutate`: optimistically increments `completedSets` in both `workoutQueryKeys.detail(listId)` and matching entry in `workoutQueryKeys.lists`.
    - Calls `PATCH /workout-lists/:listId/exercises/:exerciseId/progress`; server clamps to `sets` and sets `lastUsedAt`, returning the authoritative list.
    - `onSuccess`: writes server response into detail + lists cache.
    - `onError`: rolls back to snapshot from `onMutate`.

### Progress reset

12. `handleResetAll`: confirm «Reset all progress?» → on OK calls `resetAllProgress(workout.id)`.
13. `useResetWorkoutProgressMutation()` (async, optimistic): zeros `completedSets` in detail + lists cache immediately, then calls `POST /workout-lists/:listId/reset`. UI updates immediately; progress bars animate via CSS `transition: width` on `.progressBarFill` and `.progressBar`. On error — rollback; on success — server response written to cache.

### Progress

14. `calculateProgress()`: `totalExercises`, `completedExercises` (where `sets > 0 && completedSets === sets`), `overallProgress = completedExercises / totalExercises * 100`.

### Workout completion celebration (confetti)

15. When `completedExercises` **transitions** from strictly less than `totalExercises` to equal to `totalExercises`, and `totalExercises > 0`, `WorkoutModePageLogicLayer` fires a short confetti burst via **`canvas-confetti`** (explicit `package.json` dependency; do not rely on transitive `react-confetti` from dev tooling).
16. Implementation: `useEffect` depends on `completedExercises`, `totalExercises`, route `id`, and `workout`. `prevCompletedExercisesRef: useRef<number | null>(null)` stores the previous `completedExercises`. The effect **returns early** while `workout` is null/undefined or `workout.id !== id` so progress is not sampled during route transitions (avoids treating a transient `0` completed count as “previous” before the correct list loads). After handling, the ref is updated to the current `completedExercises`. Fire only if `prev !== null`, `prev < totalExercises`, and `completedExercises === totalExercises` — so the **first paint** with an already-fully-completed list (e.g. user re-opens the page) does **not** trigger confetti.
17. When route `id` changes (`/workout/$id`), reset `prevCompletedExercisesRef` to `null` (separate `useEffect` on `id`) so counters are not compared across different lists.
18. After **Reset all progress** and completing the workout again, confetti runs again on the same transition (not all → all).
19. No confetti when `totalExercises === 0`. Presentation and data-layer props are unchanged; effect stays in the logic layer only.

---

## Data Model

### WorkoutExercise

```typescript
interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  weight: number;
  reps: number;
  sets: number;
  completedSets: number;
}
```

### Props WorkoutModePage (Presentation)

```typescript
type Props = {
  currentWorkout: WorkoutList | null;
  justCompleted: string | null;
  totalExercises: number;
  completedExercises: number;
  overallProgress: number;
  onTap: (exerciseId: string) => void;
  onResetAll: () => void;
};
```

Note: Presentation prop remains `currentWorkout` (may be `null` for not-found inside the page component); LogicLayer receives `workout` from the data layer.

### Props WorkoutModePageLogicLayer

```typescript
type Props = {
  id: string;
  workout: WorkoutList | null | undefined;
  updateWorkoutProgress: (listId: string, exerciseId: string) => Promise<void>;
  resetAllProgress: (listId: string) => Promise<void>;
};
```

### Relationships

- `workout` — from `useWorkoutQuery(id)` cache (`GET /workout-lists/:id`).
- Progress mutations keep `workoutQueryKeys.detail(id)` and `workoutQueryKeys.lists` in sync.

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Routing | TanStack Router (`useParams`, `Link`) |
| Server state | `@tanstack/react-query` (query + optimistic mutations) |
| UI | React 18, Headless UI (`Transition`), SCSS Modules, NotFoundMessage (from `widgets/not-found-message`) |
| Dialogs | `useConfirm` |
| Animation | `Transition` for checkmark when exercise completes; progress bars use CSS `transition: width` (overall + per exercise), including when progress resets; `canvas-confetti` burst when all exercises complete (transition only, not on initial load of an already-complete workout) |

### Patterns

- 3-layer: Data → Logic → Presentation
- Double-tap: `useRef` to store lastTap, 300ms threshold
- Optimistic updates in mutation `onMutate` / rollback in `onError`

---

## Exposed API / Methods

### Do not break when extending

| API | Type | Description |
|-----|-----|----------|
| `useWorkoutQuery(id)` | hook | Current workout from API |
| `useUpdateWorkoutProgressMutation()` | hook | +1 completedSets (optimistic + `PATCH .../progress`) |
| `useResetWorkoutProgressMutation()` | hook | Zero completedSets (optimistic + `POST .../reset`) |
| `workoutQueryKeys.detail(id)` | query key | Single-list cache key |
| `NotFoundMessage` | widget | From `widgets/not-found-message` |
| Route | — | `/workout/$id` |

### Public exports

- `WorkoutModePage` — default from `workout-mode-page-data-layer.tsx`.

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| `workout === null` | Render `NotFoundMessage` widget + Link to home |
| `workout === undefined` | Render nothing (loading) |
| Non-existent `id` | `GET /workout-lists/:id` returns 404/not owned → query data `null` |
| `exercise.completedSets >= exercise.sets` | Click does not increase completedSets |
| Double-tap < 300ms | Treated as single action, `handleExerciseClick` runs |
| `resetAllProgress` | Detail + lists cache synced; counts and bars reflect reset with same width transition as fill |
| API error in progress mutation | Optimistic update rolled back via `onError` |
| Empty `exercises` | `totalExercises = 0`, `overallProgress = 0` |
| `justCompleted` | Checkmark animation 1s, then reset |
| `exercise.sets === 0` | `progress = 0`, `isCompleted = false`, exercise not counted in completedExercises |
| Workout already 100% on first open | No confetti (`prevCompletedExercisesRef` initialized without a prior “incomplete” sample) |
| All exercises complete during session | Confetti once per transition to 100% |
| Route `id` changes | `prevCompletedExercisesRef` reset so the new list does not inherit the old comparison |
| `totalExercises === 0` | No confetti |
