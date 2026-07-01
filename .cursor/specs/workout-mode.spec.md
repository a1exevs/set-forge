# Specification: Workout Mode Page

## Overview

Page for running a workout. Entering workout mode for a workout list **starts or resumes a workout session** (a snapshot of the list taken on the server). All progress is tracked on the session, not on the list template. The page shows the session's exercises, supports double-tap to mark a set, shows overall progress, and exposes a bottom **Finish workout** button to end the session early. Data comes from TanStack Query (`useWorkoutSessionForListQuery`).

---

## Current Logic

### Initialization

1. Route `/workout/$id` renders `WorkoutModeRoute`, which extracts `id` (the **workout list id**) via `useParams({ from: '/workout/$id' })`.
2. `WorkoutModePageDataLayer` receives `id`, calls `useWorkoutSessionForListQuery(id)`, `useIncrementSessionProgressMutation()`, `useFinishWorkoutSessionMutation()`.
3. Passes `session` to LogicLayer: `undefined` while loading, `null` when not available (e.g. start failed), `WorkoutSession` when loaded.

### Session loading (start-or-resume)

4. `useWorkoutSessionForListQuery(id)`: `queryFn` calls `startWorkoutSession(id)` → `POST /workout-sessions` `{ workoutListId }`. The endpoint is idempotent: it **resumes** the existing active session for the list (200) or **creates** a fresh snapshot (201). The query is configured with `staleTime: Infinity`, `refetchOnWindowFocus: false`, `retry: false` so a session is created/resumed only on mount/key change (never silently spawned on refocus). Cached under `workoutSessionQueryKeys.forList(id)`.
5. After a session has been **completed**, re-entering workout mode starts a brand-new active session (the completed one is no longer active).

### Display

6. `session === undefined`: render nothing (loading).
7. `session === null`: render `NotFoundMessage` widget («Workout list not found» + «Back to Home»).
8. Otherwise: header with `workoutListName`, overall progress (completed/total exercises, %), list of exercise cards, and a bottom **Finish workout** button.

### Set marking (double-tap)

9. `handleTap(exerciseId)`: 300ms double-tap detection via `lastTapRef`; double-tap → `handleExerciseClick`.
10. `handleExerciseClick(exerciseId)`:
    - No-op when the session is finished (`status === 'completed'`).
    - Finds exercise in `session.exercises`. If `completedSets < sets` → `incrementProgress(sessionId, exerciseId)`.
    - When `completedSets + 1 === sets` → `setJustCompleted(exerciseId)`, reset after 1s.

### Progress update (mutation)

11. `useIncrementSessionProgressMutation()` (async, optimistic):
    - vars `{ sessionId, workoutListId, exerciseId }`.
    - `onMutate`: optimistically increments `completedSets` in `workoutSessionQueryKeys.forList(workoutListId)`.
    - Calls `PATCH /workout-sessions/:id/exercises/:exerciseId/progress`; server clamps to `sets` and **auto-finishes** the session when every exercise is complete, returning the authoritative session.
    - `onSuccess`: writes server response into `forList` + `detail` caches.
    - `onError`: rolls back to the `onMutate` snapshot.

### Finishing the workout

12. **Auto-finish (last set)**: when the last remaining set is marked, the server flips the session to `completed` and stamps `finishedAt`. The returned session disables further interaction.
13. **Auto-finish on entry (resync edge)**: a session can be entered already fully complete but still `active` — this happens when the workout list was edited mid-session and resynced down to all-complete (resync never auto-finishes server-side). On load the logic layer detects `status === 'active'` + every set complete and calls `finishSession(session.id)` once, so the user lands on the completed session with its celebration instead of a fresh empty one.
14. **Early finish**: `handleFinish` confirms «Finish workout?» → on OK calls `finishSession(sessionId)` → `useFinishWorkoutSessionMutation()` → `POST /workout-sessions/:id/finish`. The session becomes `completed` with whatever progress exists.
15. The **Finish workout** button is disabled once `status === 'completed'` (label becomes «Workout completed»).
16. There is **no Reset**: finishing is terminal; re-entering a completed list creates a new session.

### Progress

17. `calculateProgress()`: `totalExercises`, `completedExercises` (where `sets > 0 && completedSets === sets`), `overallProgress = completedExercises / totalExercises * 100`.

### Workout completion celebration (confetti)

18. The celebration (`canvas-confetti` burst) fires **once per session**, guarded by `confettiFiredRef`. Two triggers, handled in one `useEffect` (deps: `session`, `completedExercises`, `totalExercises`, `finishSession`):
    - **In-session transition** — `prev !== null && prev < totalExercises && completedExercises === totalExercises` (the last set was just marked).
    - **Already complete on entry** — `prev === null && completedExercises === totalExercises && status === 'active'` (the resync edge from item 13). In this branch the effect also calls `finishSession(session.id)`.
19. `prevCompletedExercisesRef` stores the previous completed count; a separate effect resets both it (`null`) and `confettiFiredRef` (`false`) when the **session id** changes. The early-finish button (item 14) fires the same guarded burst after `finishSession` resolves, so a manual finish and the transition can never double-fire.

---

## Data Model

### WorkoutSessionExercise

```typescript
interface WorkoutSessionExercise {
  id: string;
  sourceExerciseId: string | null;
  name: string;
  muscleGroup: MuscleGroup;
  weight: number;
  reps: number;
  sets: number;
  completedSets: number;
}
```

> The workout list template (`WorkoutExercise`) no longer carries `completedSets`; progress lives only on the session.

### Props WorkoutModePage (Presentation)

```typescript
type Props = {
  session: WorkoutSession | null;
  justCompleted: string | null;
  isFinished: boolean;
  totalExercises: number;
  completedExercises: number;
  overallProgress: number;
  onTap: (exerciseId: string) => void;
  onFinish: () => void;
};
```

### Props WorkoutModePageLogicLayer

```typescript
type Props = {
  session: WorkoutSession | null | undefined;
  incrementProgress: (sessionId: string, exerciseId: string) => Promise<void>;
  finishSession: (sessionId: string) => Promise<void>;
};
```

### Relationships

- `session` — from `useWorkoutSessionForListQuery(id)` cache (`POST /workout-sessions`).
- Increment/finish mutations keep `workoutSessionQueryKeys.forList(workoutListId)` and `workoutSessionQueryKeys.detail(id)` in sync.

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Routing | TanStack Router (`useParams`, `Link`) |
| Server state | `@tanstack/react-query` (query + optimistic mutations) |
| UI | React 18, Headless UI (`Transition`), SCSS Modules, `NotFoundMessage` |
| Dialogs | `useConfirm` |
| Animation | `Transition` checkmark; CSS `transition: width` progress bars; `canvas-confetti` burst on full completion |

### Patterns

- 3-layer: Data → Logic → Presentation
- Double-tap: `useRef` + 300ms threshold
- Optimistic updates in mutation `onMutate` / rollback in `onError`

---

## Exposed API / Methods

### Do not break when extending

| API | Type | Description |
|-----|-----|----------|
| `useWorkoutSessionForListQuery(id)` | hook | Start/resume the active session for a list |
| `useIncrementSessionProgressMutation()` | hook | +1 completedSets (optimistic + `PATCH .../progress`, server auto-finishes) |
| `useFinishWorkoutSessionMutation()` | hook | Finish session early (`POST .../finish`) |
| `workoutSessionQueryKeys.forList(id)` / `.detail(id)` | query keys | Session caches |
| `NotFoundMessage` | widget | From `widgets/not-found-message` |
| Route | — | `/workout/$id` (`$id` = workout list id) |

### Public exports

- `WorkoutModePage` — default from `workout-mode-page-data-layer.tsx`.

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| `session === null` | Render `NotFoundMessage` widget + Link to home |
| `session === undefined` | Render nothing (loading) |
| List has no exercises | `POST /workout-sessions` 400 → query error → `session` null |
| `exercise.completedSets >= exercise.sets` | Click does not increase completedSets |
| Session already `completed` | Taps are no-ops; Finish button disabled |
| Double-tap < 300ms | Treated as single action, `handleExerciseClick` runs |
| API error in progress mutation | Optimistic update rolled back via `onError` |
| Empty `exercises` | `totalExercises = 0`, `overallProgress = 0` |
| `justCompleted` | Checkmark animation 1s, then reset |
| All exercises complete during session | Server auto-finishes; confetti once per transition to 100% |
| Enter an active session already fully complete (resync edge) | Confetti + `finishSession` called once on load, landing on the completed state |
| Re-enter after completion | A new active session is created |
| Session id changes | `prevCompletedExercisesRef` and `confettiFiredRef` reset so the new session does not inherit the old comparison/celebration |
