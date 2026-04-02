# Specification: Workout Mode Page

## Overview

Page for running a workout from a selected workout list: display exercises, double-tap to mark a set, overall progress, reset progress. Data comes from `currentWorkout` in store.

---

## Current Logic

### Initialization

1. Route `/workout/$id` renders `WorkoutModeRoute`, which extracts `id` via `useParams({ from: '/workout/$id' })`.
2. `WorkoutModePageDataLayer` receives `id`, subscribes to `currentWorkout`, `setCurrentWorkout`, `clearCurrentWorkout`, `updateWorkoutProgress`, `resetAllProgress`.
3. In `useEffect`, when `id` is present, `setCurrentWorkout(id)` is called. Cleanup — `clearCurrentWorkout`.

### Workout loading

4. `setCurrentWorkout(id)`: store calls `workoutListStorage.getList(id)`. When list exists — `state.currentWorkout = list`.
5. `getList` reads from `localStorage`, finds list by `id`.

### Display

6. `currentWorkout === null`: render `NotFoundMessage` widget (from `widgets/not-found-message`): «Workout list not found» + «Back to Home» link.
7. Otherwise: header with name, description, overall progress (completed/total exercises, %), list of exercise cards.

### Set marking (double-tap)

8. `handleTap(exerciseId)`:
   - `lastTapRef.current[exerciseId]` stores timestamp of last tap.
   - If `timeSinceLastTap < 300ms` and `> 0` — treat as double-tap → `handleExerciseClick(exerciseId)`.
   - Otherwise — update `lastTapRef.current[exerciseId] = now`.
9. `handleExerciseClick(exerciseId)`:
   - Finds exercise in `currentWorkout.exercises`.
   - If `completedSets < sets` → `updateWorkoutProgress(listId, exerciseId)`.
   - When `completedSets + 1 === sets` → `setJustCompleted(exerciseId)`, reset after 1s.

### Progress update in store

10. `updateWorkoutProgress(listId, exerciseId)`:
    - Finds list in `workoutLists`, exercise in list.
    - If `completedSets < sets` → `exercise.completedSets += 1`.
    - `list.lastUsedAt = new Date().toISOString()`.
    - If `currentWorkout?.id === listId` — syncs `currentWorkout.exercises` and `currentWorkout.lastUsedAt`.
    - `workoutListStorage.saveList(list)`.

### Progress reset

11. `handleResetAll`: confirm «Reset all progress?» → on OK calls `resetAllProgress(currentWorkout.id)`.
12. `resetAllProgress(listId)`: zeros `completedSets` for all exercises in the matching list from `workoutLists`, saves to storage. If `currentWorkout?.id === listId`, also zeros `completedSets` on each exercise in `currentWorkout.exercises` (same sync pattern as `updateWorkoutProgress`). UI updates immediately; progress bars animate via CSS `transition: width` on `.progressBarFill` and `.progressBar`.

### Progress

13. `calculateProgress()`: `totalExercises`, `completedExercises` (where `sets > 0 && completedSets === sets`), `overallProgress = completedExercises / totalExercises * 100`.

### Workout completion celebration (confetti)

14. When `completedExercises` **transitions** from strictly less than `totalExercises` to equal to `totalExercises`, and `totalExercises > 0`, `WorkoutModePageLogicLayer` fires a short confetti burst via **`canvas-confetti`** (explicit `package.json` dependency; do not rely on transitive `react-confetti` from dev tooling).
15. Implementation: `useEffect` depends on `completedExercises`, `totalExercises`, route `id`, and `currentWorkout`. `prevCompletedRef: useRef<number | null>(null)` stores the previous `completedExercises`. The effect **returns early** while `currentWorkout` is null or `currentWorkout.id !== id` so progress is not sampled during route transitions (avoids treating a transient `0` completed count as “previous” before the correct list loads). After handling, the ref is updated to the current `completedExercises`. Fire only if `prev !== null`, `prev < totalExercises`, and `completedExercises === totalExercises` — so the **first paint** with an already-fully-completed list (e.g. user re-opens the page) does **not** trigger confetti.
16. When route `id` changes (`/workout/$id`), reset `prevCompletedRef` to `null` (separate `useEffect` on `id`) so counters are not compared across different lists.
17. After **Reset all progress** and completing the workout again, confetti runs again on the same transition (not all → all).
18. No confetti when `totalExercises === 0`. Presentation and data-layer props are unchanged; effect stays in the logic layer only.

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

### Props WorkoutModePageLogicLayer

```typescript
type Props = {
  id: string;
  currentWorkout: WorkoutList | null;
  setCurrentWorkout: (id: string) => void;
  clearCurrentWorkout: () => void;
  updateWorkoutProgress: (listId: string, exerciseId: string) => void;
  resetAllProgress: (listId: string) => void;
};
```

### Relationships

- `currentWorkout` — separate copy from storage (`getList`), not a reference to element in `workoutLists`.
- On `updateWorkoutProgress` and `resetAllProgress` (and `resetExerciseProgress`), both `workoutLists` and `currentWorkout` stay in sync when list ids match.

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Routing | TanStack Router (`useParams`, `Link`) |
| State | Zustand, `currentWorkout` in store |
| UI | React 18, Headless UI (`Transition`), SCSS Modules, NotFoundMessage (from `widgets/not-found-message`) |
| Dialogs | `useConfirm` |
| Animation | `Transition` for checkmark when exercise completes; progress bars use CSS `transition: width` (overall + per exercise), including when progress resets; `canvas-confetti` burst when all exercises complete (transition only, not on initial load of an already-complete workout) |

### Patterns

- 3-layer: Data → Logic → Presentation
- Double-tap: `useRef` to store lastTap, 300ms threshold
- Cleanup: `clearCurrentWorkout` on unmount

---

## Exposed API / Methods

### Do not break when extending

| API | Type | Description |
|-----|-----|----------|
| `useWorkoutListStore.use.currentWorkout()` | selector | Current workout |
| `useWorkoutListStore.use.setCurrentWorkout(id)` | action | Set currentWorkout from storage |
| `useWorkoutListStore.use.clearCurrentWorkout()` | action | Clear currentWorkout |
| `useWorkoutListStore.use.updateWorkoutProgress(listId, exerciseId)` | action | +1 completedSets |
| `useWorkoutListStore.use.resetAllProgress(listId)` | action | Zero completedSets |
| `workoutListStorage.getList(id)` | method | Get list by id |
| `NotFoundMessage` | widget | From `widgets/not-found-message` |
| Route | — | `/workout/$id` |

### Public exports

- `WorkoutModePage` — default from `workout-mode-page-data-layer.tsx`.

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| `currentWorkout === null` | Render `NotFoundMessage` widget + Link to home |
| Non-existent `id` | `getList(id)` returns `null` → `currentWorkout` stays `null` |
| `exercise.completedSets >= exercise.sets` | Click does not increase completedSets |
| Double-tap < 300ms | Treated as single action, `handleExerciseClick` runs |
| `resetAllProgress` | `currentWorkout` synced when ids match; counts and bars reflect reset with same width transition as fill |
| Error on `workoutListStorage.saveList` in updateWorkoutProgress | `state.error` updated, progress in memory already changed |
| Empty `exercises` | `totalExercises = 0`, `overallProgress = 0` |
| `justCompleted` | Checkmark animation 1s, then reset |
| `exercise.sets === 0` | `progress = 0`, `isCompleted = false`, exercise not counted in completedExercises |
| Workout already 100% on first open | No confetti (`prevCompletedRef` initialized without a prior “incomplete” sample) |
| All exercises complete during session | Confetti once per transition to 100% |
| Route `id` changes | `prevCompletedRef` reset so the new list does not inherit the old comparison |
| `totalExercises === 0` | No confetti |
