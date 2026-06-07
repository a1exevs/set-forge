# Specification: Workout List API (server + client integration)

## Overview

Backend REST API for the full Workout List lifecycle (create, read, update, delete, run in workout mode). Implemented as a NestJS `workout-lists` module (controller + service + Sequelize models) scoped to the authenticated user, documented in Swagger and covered by unit tests. The client consumes this API through TanStack Query hooks in `entities/workout-list/model/use-workout-queries.ts`.

This spec aligns with [auth-session.spec.md](auth-session.spec.md) (envelope, base URL, guards) and updates the persistence sections of [home-page.spec.md](home-page.spec.md), [create-workout.spec.md](create-workout.spec.md), [edit-workout-list.spec.md](edit-workout-list.spec.md) and [workout-mode.spec.md](workout-mode.spec.md).

---

## API contract

- Base: same-origin `/api/1.0` (global prefix `app.setGlobalPrefix('api/1.0')`).
- Controller segment: `workout-lists`.
- All requests authenticated: `Authorization: Bearer <access>` + refresh cookie, `credentials: 'include'`.
- Responses follow `CommonResponse`: `{ data, messages, fieldsErrors, resultCode }`. Success `resultCode === 0` (OK).
- Every endpoint is guarded by `JwtAuthGuard` + `RefreshTokenGuard` and scoped to `request.user.id` (owner). Endpoints use `ResponseInterceptor` (wraps return in envelope) and `HttpExceptionFilter` (error envelope).

### Endpoints

| Method | Path | Body / params | Description |
|--------|------|---------------|-------------|
| GET | `/workout-lists` | — | All workout lists owned by the current user |
| GET | `/workout-lists/:id` | `id` (UUID) | One owned list; 404 if missing/not owned |
| POST | `/workout-lists` | `CreateWorkoutListRequest` | Create a new list, returns created list |
| PUT | `/workout-lists/:id` | `UpdateWorkoutListRequest` | Replace name/description/exercises, returns updated list |
| DELETE | `/workout-lists/:id` | `id` (UUID) | Delete an owned list, returns `{ result: true }` |
| PATCH | `/workout-lists/:id/exercises/:exerciseId/progress` | `id`, `exerciseId` | +1 `completedSets` for the exercise (clamped to `sets`), set `lastUsedAt`; returns updated list |
| POST | `/workout-lists/:id/reset` | `id` (UUID) | Zero `completedSets` for all exercises; returns updated list |

### Response payloads (`data`)

List endpoints return a `WorkoutList` matching the client model:

```typescript
{
  id: string;            // UUID
  name: string;
  description: string;
  exercises: {
    id: string;          // UUID
    name: string;
    muscleGroup: MuscleGroup;
    weight: number;
    reps: number;
    sets: number;
    completedSets: number;
  }[];                   // ordered by `position`
  createdAt: string;     // ISO
  lastUsedAt: string | null; // ISO or null
}
```

`GET /workout-lists` returns `WorkoutList[]`. `DELETE` returns `{ result: boolean }`.

---

## Data Model (server)

Sequelize + MySQL, `synchronize: false` (schema via migration). Two tables.

### workout_lists

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK, default `UUIDV4` |
| `user_id` | INTEGER | FK → `users.id`, `ON DELETE CASCADE`, not null |
| `name` | STRING | not null |
| `description` | STRING | nullable (stored/serialised as `''`) |
| `created_at` | DATE | not null |
| `last_used_at` | DATE | nullable |

`@HasMany(() => WorkoutExercise)`.

### workout_exercises

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK, default `UUIDV4` |
| `workout_list_id` | UUID | FK → `workout_lists.id`, `ON DELETE CASCADE`, not null |
| `name` | STRING | not null |
| `muscle_group` | STRING | not null, one of MuscleGroup |
| `weight` | FLOAT | not null, `>= 0` |
| `reps` | INTEGER | not null, `> 0` |
| `sets` | INTEGER | not null, `> 0` |
| `completed_sets` | INTEGER | not null, default `0` |
| `position` | INTEGER | not null — preserves exercise order |

`@BelongsTo(() => WorkoutList)`.

### MuscleGroup

`'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio'`.

---

## DTOs (server, namespace + Swagger pattern)

```typescript
// CreateWorkoutListRequest.Dto
{
  name: string;          // @IsString, not empty
  description: string;   // @IsString (allow '')
  exercises: {
    name: string;        // @IsString, not empty
    muscleGroup: MuscleGroup; // @IsIn(muscleGroups)
    weight: number;      // @IsNumber, @Min(0)
    reps: number;        // @IsInt, @Min(1)
    sets: number;        // @IsInt, @Min(1)
  }[];                   // @ValidateNested({ each: true })
}

// UpdateWorkoutListRequest.Dto
{
  name: string;
  description: string;
  exercises: (CreateExercise & { id?: string; completedSets?: number })[];
}
```

- Existing exercises carry `id` (+ optional `completedSets`); new exercises omit `id`.
- On update the server reconciles: keep existing by `id` (preserving `completedSets` unless provided), insert new (generate `id`, `completedSets: 0`), delete omitted. `position` follows array order.

---

## Service behaviour

`WorkoutListsService` (injects both models via `@InjectModel`):

- `getAll(userId)`: lists for user, exercises ordered by `position`, mapped to `WorkoutList`.
- `getOne(userId, id)`: single list; throws `NotFoundException` when missing or not owned.
- `create(userId, dto)`: create list + exercises in a transaction; `createdAt = now`, `lastUsedAt = null`, `completedSets = 0`.
- `update(userId, id, dto)`: ownership check, then reconcile exercises (see DTOs); returns updated list.
- `remove(userId, id)`: ownership check, delete (cascade removes exercises); returns `{ result: true }`.
- `incrementProgress(userId, listId, exerciseId)`: ownership check; if `completedSets < sets` → `+1`; set `lastUsedAt = now`; returns updated list. No-op increment when already at `sets`.
- `resetAll(userId, listId)`: ownership check; set all `completedSets = 0`; returns updated list.

Ownership: all queries filter by `userId`. A list belonging to another user is treated as not found (`NotFoundException`).

---

## Client integration

- API service `entities/workout-list/api/workout-list-api.ts` using shared `apiRequest` (`auth: true`) + `ResultCodes`, mirroring `entities/session/api/session-api.ts`. **Not** re-exported from `@entities`; consumed only by query hooks and tests.
- TanStack Query hooks in `entities/workout-list/model/use-workout-queries.ts`:
  - `useWorkoutListsQuery(enabled)` — `GET /workout-lists` → `workoutQueryKeys.lists`.
  - `useWorkoutQuery(id)` — `GET /workout-lists/:id` → `workoutQueryKeys.detail(id)`; `null` on 404.
  - `useCreateWorkoutListMutation()` — `POST`; appends to lists cache on success.
  - `useUpdateWorkoutListMutation()` — `PUT`; updates detail + lists cache.
  - `useDeleteWorkoutListMutation()` — `DELETE`; removes from lists cache, drops detail key.
  - `useUpdateWorkoutProgressMutation()` — optimistic `+1`, then `PATCH .../progress`; rollback on error, server response on success.
  - `useResetWorkoutProgressMutation()` — optimistic zero, then `POST .../reset`; same cache sync pattern.
- Query keys: `workoutQueryKeys.lists`, `workoutQueryKeys.detail(id)`.
- Initial load: `HomePageDataLayer` calls `useWorkoutListsQuery(Boolean(user))` when session exists.
- IDs are server-generated (UUID strings); the client no longer calls `crypto.randomUUID()` for list/exercise ids (form `tempId` is local-only).

---

## Tech Stack

| Area | Choice |
|------|--------|
| Server framework | NestJS 9, `@nestjs/sequelize`, `sequelize-typescript`, MySQL |
| Auth | `JwtAuthGuard` + `RefreshTokenGuard` (`@common/guards`), owner = `request.user.id` |
| Envelope | `ResponseInterceptor` + `HttpExceptionFilter` (`CommonResponse`) |
| Docs | Swagger (`@ApiTags`, `@ApiOperation`, `@ApiOkResponse`, `@ApiResult`), served at `/api/docs` (non-prod) |
| Validation | `class-validator` on DTOs |
| Tests | Jest + `@nestjs/testing`; service spec via `getModelToken`, controller spec mocks service + `JwtService` |
| Client | `apiRequest` wrapper, `@tanstack/react-query` hooks, TanStack Router pages |

---

## Exposed API / Methods (do not break)

| API | Type | Description |
|-----|------|-------------|
| `useWorkoutListsQuery(enabled)` | hook | List of workout lists |
| `useWorkoutQuery(id)` | hook | Single workout (`null` when missing) |
| `useCreateWorkoutListMutation()` | hook | Create via API |
| `useUpdateWorkoutListMutation()` | hook | Update via API |
| `useDeleteWorkoutListMutation()` | hook | Delete via API |
| `useUpdateWorkoutProgressMutation()` | hook | +1 completedSets (optimistic + PATCH) |
| `useResetWorkoutProgressMutation()` | hook | Zero completedSets (optimistic + POST) |
| `workoutQueryKeys.lists` | query key | Lists cache |
| `workoutQueryKeys.detail(id)` | query key | Detail cache |
| Routes | — | `/workout-lists`, `/workout-lists/:id`, `/workout-lists/:id/reset`, `/workout-lists/:id/exercises/:exerciseId/progress` |

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Unauthenticated request | `JwtAuthGuard`/`RefreshTokenGuard` → 401 envelope |
| `:id` not owned / missing | `NotFoundException` → 404 envelope; client `useWorkoutQuery` resolves `null` |
| Invalid create/update DTO | `class-validator` → 400 envelope with messages |
| Progress when `completedSets === sets` | No increment, list returned unchanged |
| `sets === 0` | Disallowed by validation (`@Min(1)`) |
| Update removes an exercise | Exercise row deleted; `position` recomputed from array order |
| Update adds an exercise | New row, generated `id`, `completedSets: 0` |
| Update keeps an exercise | `id` preserved; `completedSets` preserved unless supplied |
| Delete cascade | Removing a list deletes its `workout_exercises` rows |
| Network/API error in mutation | Mutation error; create/update data layers return `false`; navigation does not run |
| Reload (no in-memory token) | `apiRequest` refresh flow restores session; queries refetch from server |
