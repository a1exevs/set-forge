# Specification: Workout Mode Page

## Overview

Runs a workout for a list at `/workout/$id` (`$id` = [workout list](../entities/workout-list.entity.spec.md) id). Opens in **preview** (no session) or **training** (active session from resume or Start). Progress lives on session [exercises](../entities/workout-session-exercise.entity.spec.md). Requires authenticated session ([user](../entities/user.entity.spec.md)). Double-tap marks sets; **Finish workout** ends early with optional discard; confetti on full completion.

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
- `ui/specs/workout-mode-page.spec.unit.tsx`
- `ui/specs/workout-mode-page-logic-layer.spec.unit.tsx`

---

## UI

### Main content

1. **Loading** (`workoutList === undefined`): render nothing.
2. **Not found** (`workoutList === null`): `NotFoundMessage`.
3. **Preview** (`workoutList` loaded, no active session): header with `workoutListName`, progress `0 / N exercises`, 0%; friendly hint above **Start workout** (tap only when ready — timer starts on Start); **Start workout** button (same style as Finish); no exercise cards.
4. **Training** (`session !== null`): header, overall progress bar, exercise cards, bottom **Finish workout** (disabled when completed — label «Workout completed»).
5. Double-tap exercise card (training only): checkmark animation on last set (`justCompleted` prop).

### Celebration

1. `canvas-confetti` once per session: after progress auto-finishes the last set, on the resync-all-complete-on-entry edge, or after manual Finish (training only).

---

## Current Logic

### Session loading

1. Data layer: `useWorkoutQuery(id)` + `useActiveWorkoutSessionQuery(id)`; `isLoading` → `workoutList: undefined`.
2. Session derivation (data layer): `activeSession` from query cache first (kept fresh by `syncSessionCaches` on start/increment/resync), then `finishWorkoutSessionMutation.data` / `incrementSessionProgressMutation.data` (completed in-page while `active` is null), then `startWorkoutSessionMutation.data` (fallback before active cache updates). After discard, mutation caches are reset and `active` is null → preview.
3. Phase: `training` when `session !== null` (active, just-started, or completed in-page); else `preview` when list loaded.
4. `POST /workout-sessions` only on **Start workout** click (`useStartWorkoutSessionMutation`), not on mount.
5. Re-entering after completion: `GET /active` → null → preview; Start creates new session.

### Set marking (training only)

6. 300ms double-tap → `incrementProgress` if `completedSets < sets` and session active.
7. Optimistic `PATCH .../progress` (serialized; `onSuccess` merges with `max(completedSets)` so slow responses cannot rewind the UI). Server auto-finishes when all exercises complete; confetti when progress returns `status: completed` (no client `finish` on this path — avoids racing the last PATCH).

### Finishing

8. Early finish: three-way confirm → **Finish** (`POST .../finish`, saved to history) | **Discard** (`DELETE .../:id`, return to preview) | **Cancel**.
9. Resync edge on entry: on first observation of a session, if `active` but all sets already complete → auto `finishSession` once + confetti. Not re-run when sets become complete mid-workout.

### Progress

10. Preview: `totalExercises = workoutList.exercises.length`, `completedExercises = 0`, `overallProgress = 0`.
11. Training: `completedExercises` where `completedSets === sets` (and `sets > 0`); `overallProgress` percentage.

---

## Data Model

### Props WorkoutModePage (Presentation)

```typescript
type WorkoutPhase = 'preview' | 'training';

type Props = {
  phase: WorkoutPhase;
  workoutList: WorkoutList | null;
  session: WorkoutSession | null;
  justCompleted: string | null;
  isFinished: boolean;
  totalExercises: number;
  completedExercises: number;
  overallProgress: number;
  isStarting: boolean;
  onTap: (exerciseId: string) => void;
  onStart: () => void;
  onFinish: () => void;
};
```

### Props WorkoutModePageLogicLayer

```typescript
type Props = {
  workoutList: WorkoutList | null | undefined;
  session: WorkoutSession | null;
  isStarting: boolean;
  startSession: (workoutListId: string) => Promise<void>;
  incrementProgress: (sessionId: string, exerciseId: string) => Promise<WorkoutSession>;
  finishSession: (sessionId: string) => Promise<void>;
  discardSession: (sessionId: string) => Promise<void>;
};
```

---

## API usage

| Method | Path | Hook / trigger |
|--------|------|----------------|
| GET | `/workout-lists/:id` | `useWorkoutQuery` |
| GET | `/workout-sessions/active?workoutListId=` | `useActiveWorkoutSessionQuery` |
| POST | `/workout-sessions` | `useStartWorkoutSessionMutation` (Start workout) |
| PATCH | `/workout-sessions/:id/exercises/:exerciseId/progress` | `useIncrementSessionProgressMutation` |
| POST | `/workout-sessions/:id/finish` | `useFinishWorkoutSessionMutation` |
| DELETE | `/workout-sessions/:id` | `useDiscardWorkoutSessionMutation` |

Full contract: [workout-session entity](../entities/workout-session.entity.spec.md#api-contract).

---

## Tech Stack

TanStack Router, React Query (optimistic mutations), Headless UI `Transition`, `canvas-confetti`, `NotFoundMessage` widget, extended `useConfirm` (alternate action).

---

## Exposed API / Methods

| API | Type | Description |
|-----|-----|-------------|
| `WorkoutModePage` | component | Default from data layer |

---

## Tests

- `ui/specs/workout-mode-page.spec.unit.tsx` — preview (Start visible, no cards), training (cards + Finish), not found
- `ui/specs/workout-mode-page-logic-layer.spec.unit.tsx` — finish vs discard vs cancel confirm; start handler; resync-edge auto-finish on entry (complete vs incomplete)

---

## Storybook

N/A — no stories file.

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| Accidental click, back without Start | No session created |
| Resume mid-workout | `GET /active` → training, skip preview |
| Discard after partial progress | DELETE → preview; history unchanged |
| Empty list | POST on Start → 400; error swallowed (TODO toaster); stays in preview |
| Completed session | Taps no-op; finish disabled |
| Progress mutation error | Optimistic rollback to `previous`, unless cache is already `completed` or ahead of this mutation’s baseline (later taps) |
| Re-enter after completion | Preview; Start creates new session |
| Resync edge on entry | Auto-finish + confetti once |

---

## References

- [workout-list.entity.spec.md](../entities/workout-list.entity.spec.md)
- [workout-session.entity.spec.md](../entities/workout-session.entity.spec.md)
- [workout-session-exercise.entity.spec.md](../entities/workout-session-exercise.entity.spec.md)
- [user.entity.spec.md](../entities/user.entity.spec.md)
- [edit-workout-page.spec.md](edit-workout-page.spec.md)
- [history-page.spec.md](history-page.spec.md)
