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

6. `currentWorkout === null`: render «Workout list not found» + «Back to Home» button.
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
12. `resetAllProgress(listId)`: zeros `completedSets` for all exercises in list from `workoutLists`, saves to storage.
13. **Known issue**: `currentWorkout` is not updated on reset — UI may show stale progress until navigation away and back.

### Progress

14. `calculateProgress()`: `totalExercises`, `completedExercises` (where `completedSets === sets`), `overallProgress = completedExercises / totalExercises * 100`.

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
- On `updateWorkoutProgress`, both `workoutLists` and `currentWorkout` are updated (when id matches).

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Routing | TanStack Router (`useParams`, `Link`) |
| State | Zustand, `currentWorkout` in store |
| UI | React 18, Headless UI (`Transition`), SCSS Modules |
| Dialogs | `useConfirm` |
| Animation | `Transition` for checkmark when exercise completes |

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
| Route | — | `/workout/$id` |

### Public exports

- `WorkoutModePage` — default from `workout-mode-page-data-layer.tsx`.

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| `currentWorkout === null` | «Workout list not found» + Link to home |
| Non-existent `id` | `getList(id)` returns `null` → `currentWorkout` stays `null` |
| `exercise.completedSets >= exercise.sets` | Click does not increase completedSets |
| Double-tap < 300ms | Treated as single action, `handleExerciseClick` runs |
| `resetAllProgress` | `currentWorkout` not synced — UI may show stale progress until navigation |
| Error on `workoutListStorage.saveList` in updateWorkoutProgress | `state.error` updated, progress in memory already changed |
| Empty `exercises` | `totalExercises = 0`, `overallProgress = 0` |
| `justCompleted` | Checkmark animation 1s, then reset |
| `exercise.sets === 0` | `progress = 0`, `isCompleted = false`, exercise not counted in completedExercises |
