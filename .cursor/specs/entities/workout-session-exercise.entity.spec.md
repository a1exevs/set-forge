# Entity: Workout Session Exercise

## Overview

A **snapshot exercise** inside an active or completed [workout session](workout-session.entity.spec.md). Copied from a [template exercise](workout-exercise.entity.spec.md) at session start; tracks `completedSets` for the current training run.

There is **no standalone REST API**; exercises are read and mutated only through session endpoints (`POST /workout-sessions`, `GET active`, history, `PATCH .../progress`, `POST .../resync`).

Related entities: [workout-session](workout-session.entity.spec.md), [workout-exercise](workout-exercise.entity.spec.md).

Table: `workout_session_exercises`.

---

## Database

### workout_session_exercises

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK, default `UUIDV4` |
| `workout_session_id` | UUID | FK → `workout_sessions.id`, `ON DELETE CASCADE`, not null |
| `source_exercise_id` | UUID | nullable — template `workout_exercises.id` for resync |
| `name` | STRING | not null |
| `muscle_group` | STRING | not null, `MuscleGroup` |
| `weight` | FLOAT | not null, default `0` |
| `reps` | INTEGER | not null |
| `sets` | INTEGER | not null |
| `completed_sets` | INTEGER | not null, default `0` |
| `position` | INTEGER | not null — order within the session |

`@BelongsTo(() => WorkoutSession)`. Model: `server/src/workout-sessions/workout-session-exercise.model.ts`.

Index: `(workout_session_id)` — `workout_session_exercises_session_id_idx`.

Migration: `20260630120000-workout-sessions.js`.

---

## Invariants

- Belongs to exactly one session; delete session cascades to rows.
- Snapshot fields (`name`, `muscleGroup`, `weight`, `reps`, `sets`) are frozen for the session unless `resync` rebuilds from the linked list.
- Exercise is **complete** when `completedSets === sets`.
- `incrementProgress` caps at `sets`; `resync` preserves `completedSets` per matching `sourceExerciseId` (clamped to new `sets`).
- `resync` never auto-finishes the session.

---

## Server

### Location

Model only: `server/src/workout-sessions/workout-session-exercise.model.ts` (wired via `WorkoutSessionsModule`).

### Models

`workout-session-exercise.model.ts` — no dedicated controller or service.

### Module wiring

- Registered in `SequelizeModule.forFeature([WorkoutSession, WorkoutSessionExercise, ...])` inside `WorkoutSessionsModule`
- Re-exported from `server/src/workout-sessions/index.ts`

---

## Client

### Location

`client/src/entities/workout-session-exercise/` — `model/types.ts`

No API layer or React Query hooks — type-only slice consumed by `workout-session`.

### Types

```typescript
interface WorkoutSessionExercise {
  id: string;
  sourceExerciseId: string | null;
  name: string;
  muscleGroup: MuscleGroup; // from workout-exercise
  weight: number;
  reps: number;
  sets: number;
  completedSets: number;
}
```

---

## API contract

No dedicated endpoints. Shape is nested under `WorkoutSessionResponse` — see [workout-session.entity.spec.md](workout-session.entity.spec.md).

```typescript
{
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

| Operation | Endpoint | Effect on exercises |
|-----------|----------|---------------------|
| Start / resume | `POST /workout-sessions` | Snapshot from list template |
| Read | `POST /workout-sessions`, `GET active`, history | Nested array |
| Progress | `PATCH /workout-sessions/:id/exercises/:exerciseId/progress` | `completedSets += 1` |
| Resync | `POST /workout-sessions/:id/resync` | Rebuild rows from list; keep progress by `sourceExerciseId` |

---

## Exposed API / Methods

| Export | Type | Description |
|--------|------|-------------|
| `WorkoutSessionExercise` | type | Session exercise snapshot |

Re-exported from `@entities` / `client/src/entities/workout-session-exercise`.

---

## Tests

- Unit: `workout-sessions.service.spec.ts` (progress, resync, snapshot)
- Model: `workout-sessions.model.spec.ts` — table name, columns, associations
- E2E: `workout-lists-sessions.e2e-spec.ts`

---

## Used by

- [workout-session.entity.spec.md](workout-session.entity.spec.md) — parent aggregate
- [workout-mode-page](../pages/workout-mode-page.spec.md)
- [history-page](../pages/history-page.spec.md)

---

## References

- [workout-session.entity.spec.md](workout-session.entity.spec.md)
- [workout-exercise.entity.spec.md](workout-exercise.entity.spec.md)
