# Entity: Workout Exercise

## Overview

A **template exercise** row inside a [workout list](workout-list.entity.spec.md). Stores name, muscle group, weight, reps, and sets — no per-set progress (`completedSets` lives on [workout-session-exercise](workout-session-exercise.entity.spec.md)).

There is **no standalone REST API**; exercises are created, updated, and deleted only through list CRUD, export, and import on the `workout-lists` module.

Related entities: [workout-list](workout-list.entity.spec.md), [workout-session-exercise](workout-session-exercise.entity.spec.md).

Table: `workout_exercises`.

---

## Database

### workout_exercises

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK, default `UUIDV4` |
| `workout_list_id` | UUID | FK → `workout_lists.id`, `ON DELETE CASCADE`, not null |
| `name` | STRING | not null |
| `muscle_group` | STRING | not null, one of `MuscleGroup` |
| `weight` | FLOAT | not null, default `0`, `>= 0` |
| `reps` | INTEGER | not null, `> 0` |
| `sets` | INTEGER | not null, `> 0` |
| `position` | INTEGER | not null — order within the list |

`@BelongsTo(() => WorkoutList)`. Model: `server/src/workout-lists/workout-exercise.model.ts`.

Migrations: initial list schema; `20260630130000-drop-completed-sets-from-workout-exercises.js` removed `completed_sets` from templates.

### MuscleGroup

Shared enum on server (`server/src/workout-lists/constants/muscle-groups.ts`) and client (`workout-exercise/model/types.ts`):

`'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio'`.

---

## Invariants

- Belongs to exactly one list; delete list cascades to exercises.
- At least one exercise per list on create/update (`@ArrayMinSize(1)` on list DTOs).
- On list update: existing rows keep `id`; new rows omit `id`; removed rows are deleted; `position` follows array order.
- `id` is stable across list updates so [session resync](workout-session.entity.spec.md) can match `sourceExerciseId`.

---

## Server

### Location

Model only: `server/src/workout-lists/workout-exercise.model.ts` (wired via `WorkoutListsModule`).

### Models

`workout-exercise.model.ts` — no dedicated controller or service.

### Module wiring

- Registered in `SequelizeModule.forFeature([WorkoutList, WorkoutExercise])` inside `WorkoutListsModule`
- Re-exported from `server/src/workout-lists/index.ts` for session resync (`WorkoutSessionsModule` imports `WorkoutExercise`)

---

## Client

### Location

`client/src/entities/workout-exercise/` — `model/types.ts`, `model/muscle-group-labels.ts`, `ui/workout-exercise-card/`

No API layer or React Query hooks — types, UI helpers, and preview card only.

### Types

```typescript
type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';

interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  weight: number;
  reps: number;
  sets: number;
}

type UpdateExerciseDto = Omit<WorkoutExercise, 'id'> & Partial<Pick<WorkoutExercise, 'id'>>;
```

### Helpers

- `muscleGroupLabels` — display labels for selects and chips
- `muscleGroups` — ordered array for form options

### UI

- `WorkoutExerciseCard` (`ui/workout-exercise-card/`) — read-only preview card (name, muscle badge, weight/reps/sets). No progress bar, no double-tap hint, not clickable. Used on [workout-mode](../pages/workout-mode-page.spec.md) preview phase.

---

## API contract

No dedicated endpoints. Shape is embedded in [workout-list API](workout-list.entity.spec.md):

- **Read:** nested under `WorkoutList.exercises` (`GET /workout-lists`, `GET /workout-lists/:id`)
- **Write:** nested in `CreateWorkoutListRequest` / `UpdateWorkoutListRequest` (`POST`, `PUT`)
- **Export/import:** exercise fields without `id` inside `WorkoutListsExportFileResponse` / `ImportWorkoutListsRequest`

Nested exercise payload (response):

```typescript
{ id, name, muscleGroup, weight, reps, sets } // ordered by position
```

Create/update request exercise (no `id` on create; optional `id` on update).

---

## Exposed API / Methods

| Export | Type | Description |
|--------|------|-------------|
| `WorkoutExercise` | type | Template exercise |
| `MuscleGroup` | type | Muscle group union |
| `UpdateExerciseDto` | type | Form / list update shape |
| `muscleGroupLabels` | const | UI labels |
| `muscleGroups` | const | Select options |
| `WorkoutExerciseCard` | component | Read-only preview exercise card |

Re-exported from `@entities` / `client/src/entities/workout-exercise`.

---

## Tests

- Covered indirectly: `workout-lists.service.spec.ts`, `workout-lists.controller.spec.ts`, list DTO specs, E2E `workout-lists-sessions.e2e-spec.ts`
- Model associations: `workout-sessions.model.spec.ts` (module fixture includes `WorkoutExercise`)
- UI: `ui/workout-exercise-card/specs/workout-exercise-card.spec.unit.tsx`, `ui/workout-exercise-card/specs/workout-exercise-card.spec.snap.tsx`

---

## Storybook

- `ui/workout-exercise-card/workout-exercise-card.stories.tsx` — `Entities/WorkoutExerciseCard`

---

## Used by

- [workout-list.entity.spec.md](workout-list.entity.spec.md) — parent aggregate
- [create-workout-page](../pages/create-workout-page.spec.md)
- [edit-workout-page](../pages/edit-workout-page.spec.md)
- [workout-mode-page](../pages/workout-mode-page.spec.md) — preview cards via `WorkoutExerciseCard`
- [workout-session-exercise.entity.spec.md](workout-session-exercise.entity.spec.md) — `sourceExerciseId` link

---

## References

- [workout-list.entity.spec.md](workout-list.entity.spec.md)
- [workout-session.entity.spec.md](workout-session.entity.spec.md)
