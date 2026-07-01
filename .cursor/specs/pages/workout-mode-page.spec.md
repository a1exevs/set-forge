# Specification: Workout Mode Page

## Overview

Runs a workout for a list at `/workout/$id` (`$id` = [workout list](../entities/workout-list.entity.spec.md) id). Starts or resumes a [workout session](../entities/workout-session.entity.spec.md) snapshot; progress lives on session [exercises](../entities/workout-session-exercise.entity.spec.md). Requires authenticated session ([user](../entities/user.entity.spec.md)). Double-tap marks sets; **Finish workout** ends early; confetti on full completion.

---

## Route

- Path: `/workout/$id` (protected)
- Router entry: `workout-mode-page-data-layer.tsx`
- Route file: `client/src/app/model/routes/workout/$id.tsx`

---

## Location

`client/src/pages/workout-mode/`

---

## Files

- `ui/workout-mode-page-data-layer.tsx`
- `ui/workout-mode-page-logic-layer.tsx`
- `ui/workout-mode-page.tsx`
- `ui/workout-mode-page.module.scss`
- `ui/index.ts`, `index.ts`

---

## UI

### Main content

1. Error (`session === null`): `NotFoundMessage`.
2. Active session: header `workoutListName`, overall progress bar, exercise cards, bottom **Finish workout** (disabled when completed — label «Workout completed»).
3. Double-tap exercise card: checkmark animation on last set of exercise (`justCompleted` prop).

### Celebration

1. `canvas-confetti` once per session on full completion or resync-all-complete-on-entry edge.

---

## Current Logic

### Session loading

1. Data layer: `useWorkoutSessionForListQuery(id)` maps `isLoading` → `session: undefined`.
2. Logic layer: while `session === undefined` → render nothing (loading).
3. `POST /workout-sessions` (resume 200 / create 201); `staleTime: Infinity`, no refetch on focus.
4. Re-entering after completion creates new active session.

### Set marking

5. 300ms double-tap on exercise card → `incrementProgress` if `completedSets < sets` and session active.
4. Optimistic `PATCH .../progress`; server auto-finishes when all exercises complete.

### Finishing

6. Early finish: confirm → `POST .../finish`.
7. Resync edge on entry: if active but all sets complete → auto `finishSession` once + confetti.

### Progress

8. `completedExercises` where `completedSets === sets` (and `sets > 0`); `overallProgress` percentage.

---

## Data Model

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

---

## API usage

| Method | Path | Hook |
|--------|------|------|
| POST | `/workout-sessions` | `useWorkoutSessionForListQuery` |
| PATCH | `/workout-sessions/:id/exercises/:exerciseId/progress` | `useIncrementSessionProgressMutation` |
| POST | `/workout-sessions/:id/finish` | `useFinishWorkoutSessionMutation` |

Full contract: [workout-session entity](../entities/workout-session.entity.spec.md#api-contract).

---

## Tech Stack

TanStack Router, React Query (optimistic mutations), Headless UI `Transition`, `canvas-confetti`, `NotFoundMessage` widget.

---

## Exposed API / Methods

| API | Type | Description |
|-----|-----|-------------|
| `WorkoutModePage` | component | Default from data layer |

---

## Tests

- No page-level unit/snapshot specs; entity API tests cover session calls

---

## Storybook

N/A — no stories file.

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| Empty list | POST 400 → `session` null |
| Completed session | Taps no-op; finish disabled |
| Progress mutation error | Optimistic rollback |
| Re-enter after completion | New session |
| Resync edge on entry | Auto-finish + confetti once |

---

## References

- [workout-list.entity.spec.md](../entities/workout-list.entity.spec.md)
- [workout-session.entity.spec.md](../entities/workout-session.entity.spec.md)
- [workout-session-exercise.entity.spec.md](../entities/workout-session-exercise.entity.spec.md)
- [user.entity.spec.md](../entities/user.entity.spec.md)
- [edit-workout-page.spec.md](edit-workout-page.spec.md)
- [history-page.spec.md](history-page.spec.md)
