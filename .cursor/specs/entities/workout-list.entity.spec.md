# Entity: Workout List

## Overview

Workout lists are **pure templates** for exercises (name, muscle group, weight, reps, sets). They do not track per-set progress — that lives on [workout sessions](workout-session.entity.spec.md). The NestJS `workout-lists` module provides CRUD, export, and import for lists owned by the authenticated user.

Related entities: [user](user.entity.spec.md), [workout-session](workout-session.entity.spec.md), [workout-exercise](workout-exercise.entity.spec.md).

Tables: `workout_lists` (this spec), `workout_exercises` → [workout-exercise.entity.spec.md](workout-exercise.entity.spec.md).

---

## Database

### workout_lists

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK, default `UUIDV4` |
| `user_id` | INTEGER | FK → `users.id`, `ON DELETE CASCADE`, not null |
| `name` | STRING | not null |
| `description` | STRING | stored as `''` when empty |
| `created_at` | DATE | not null |
| `last_used_at` | DATE | nullable — updated when a session starts |

`@HasMany(() => WorkoutExercise)`. Model: `server/src/workout-lists/workout-list.model.ts`.

### workout_exercises

See [workout-exercise.entity.spec.md](workout-exercise.entity.spec.md) for columns, invariants, and client types.

---

## Invariants

- All list queries filter by `userId`; another user's list → `NotFoundException`.
- `exercises` must contain at least one entry on create and update (`@ArrayMinSize(1)`). Per-exercise rules: [workout-exercise.entity.spec.md](workout-exercise.entity.spec.md).
- On update: existing exercises keep `id`; new omit `id` (server generates); removed are deleted; `position` follows array order.
- Delete cascades to `workout_exercises`.

---

## Server

### Location

`server/src/workout-lists/` — controller, service, models, `dto/`

### Models

`workout-list.model.ts` — child model: [workout-exercise.entity.spec.md](workout-exercise.entity.spec.md)

### Module wiring

- `WorkoutListsModule` in `AppModule`
- Swagger: `Docs.WORKOUT_LISTS_CONTROLLER`
- Path alias: `@workout-lists/*`
- Static routes `/export`, `/import` registered **before** `GET /:id`

---

## Client

### Location

`client/src/entities/workout-list/` — `api/workout-list-api.ts`, `model/use-workout-queries.ts`, `model/workout-query-keys.ts`, `model/types.ts`

### Types

```typescript
interface WorkoutList {
  id: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[]; // see workout-exercise.entity.spec.md
  createdAt: string;
  lastUsedAt: string | null;
}

interface CreateWorkoutListDto { name, description, exercises: Omit<WorkoutExercise, 'id'>[] }
interface UpdateWorkoutListDto { name, description, exercises: UpdateExerciseDto[] }
interface WorkoutListsExportFile { formatVersion, app, exportedAt, workoutLists }
interface ImportWorkoutListsResult { importedCount, lists: WorkoutList[] }
```

Exercise and `MuscleGroup` types: [workout-exercise.entity.spec.md](workout-exercise.entity.spec.md).

---

## API contract

- Base: `/api/1.0`. Controller: `workout-lists`.
- Auth: `JwtAuthGuard` + `RefreshTokenGuard`, `credentials: 'include'`.
- Envelope: `CommonResponse` via `ResponseInterceptor` / `HttpExceptionFilter`.

### Endpoints

| Method | Path | Body / params | Description |
|--------|------|---------------|-------------|
| GET | `/workout-lists` | — | All lists for current user |
| GET | `/workout-lists/:id` | `id` (UUID) | One owned list; 404 if missing |
| POST | `/workout-lists` | `CreateWorkoutListRequest` | Create list |
| PUT | `/workout-lists/:id` | `UpdateWorkoutListRequest` | Replace name/description/exercises |
| DELETE | `/workout-lists/:id` | `id` (UUID) | Delete list → `{ result: true }` |
| GET | `/workout-lists/export` | — | Export all as `WorkoutListsExportFileResponse` |
| POST | `/workout-lists/import` | `ImportWorkoutListsRequest` | Bulk import in one transaction |

**Reserved:** `GET /workout-lists/:id/export` — single-list export (not implemented).

### Response payload (`WorkoutList`)

```typescript
{
  id: string;
  name: string;
  description: string;
  exercises: { id, name, muscleGroup, weight, reps, sets }[]; // by position
  createdAt: string;
  lastUsedAt: string | null;
}
```

### Export / import

**Export response** (`WorkoutListsExportFileResponse`) and **import body** (`ImportWorkoutListsRequest` — extends response schema) share the same JSON shape. Client entity type: `WorkoutListsExportFile`.

```typescript
{
  formatVersion: 1;
  app: 'set-forge';
  exportedAt: string;
  workoutLists: { name, description, exercises: Omit<id>[], createdAt?, lastUsedAt? }[];
}
```

Import response: `{ importedCount: number; lists: WorkoutList[] }`. Legacy bare `WorkoutList[]` arrays are normalized server-side.

### DTOs

- `CreateWorkoutListRequest.Dto` — name, description, exercises (min 1)
- `UpdateWorkoutListRequest.Dto` — exercises may include optional `id`
- `WorkoutListResponse.Dto` — list read/create/update payload
- `WorkoutListsExportFileResponse.Dto` — export payload
- `ImportWorkoutListsRequest.Dto` — import body (extends export response)
- `ImportWorkoutListsResponse.Dto` — `{ importedCount, lists }`
- Namespace + `Swagger` sub-namespace per [server-api.mdc](../../rules/server-api.mdc)

### Service behaviour

- `getAll`, `getOne`, `create`, `update`, `remove`, `exportAll`, `importAll`
- `create`/`update` in transactions; `importAll` rolls back on any failure
- `exportAll` → `toExportFile()` strips ids

---

## Exposed API / Methods

| API | Type | Description |
|-----|-----|-------------|
| `useWorkoutListsQuery(enabled)` | hook | `GET /workout-lists` |
| `useWorkoutQuery(id)` | hook | `GET /workout-lists/:id`; `null` on 404 |
| `useCreateWorkoutListMutation()` | hook | `POST` |
| `useUpdateWorkoutListMutation()` | hook | `PUT` |
| `useDeleteWorkoutListMutation()` | hook | `DELETE` |
| `useExportAllWorkoutListsMutation()` | hook | `GET /export` |
| `useImportWorkoutListsMutation()` | hook | `POST /import` |
| `workoutQueryKeys.lists` / `.detail(id)` | query keys | Cache keys |

---

## Tests

- Unit: `workout-lists.service.spec.ts`, `workout-lists.controller.spec.ts`, DTO specs
- Client: `entities/workout-list/api/specs/workout-list-api.spec.unit.ts`
- E2E: `server/test/e2e/workout-lists-sessions.e2e-spec.ts`

---

## Used by

- [home-page](../pages/home-page.spec.md)
- [create-workout-page](../pages/create-workout-page.spec.md)
- [edit-workout-page](../pages/edit-workout-page.spec.md)
- [workout-mode-page](../pages/workout-mode-page.spec.md) — indirect via session snapshot

---

## References

- [workout-session.entity.spec.md](workout-session.entity.spec.md)
- [workout-exercise.entity.spec.md](workout-exercise.entity.spec.md)
- Migrations under `server/database/migrations/`
