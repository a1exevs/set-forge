# Specification: Workout List API (server + client integration)

## Overview

Backend REST API for the Workout List lifecycle (create, read, update, delete). The list is a **pure template** — it no longer tracks per-set progress. Running a workout and tracking progress is handled by the workout sessions API (see [workout-sessions.spec.md](workout-sessions.spec.md)). Implemented as a NestJS `workout-lists` module (controller + service + Sequelize models) scoped to the authenticated user, documented in Swagger and covered by unit tests. The client consumes this API through TanStack Query hooks in `entities/workout-list/model/use-workout-queries.ts`.

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
| GET | `/workout-lists/export` | — | Export all owned lists as `WorkoutListsExportFile` |
| POST | `/workout-lists/import` | `WorkoutListsExportFile` | Import lists from file; bulk create in one transaction; returns `{ importedCount, lists }` |

**Reserved (not implemented yet):** `GET /workout-lists/:id/export` — export a single list in the same `WorkoutListsExportFile` format (`workoutLists.length === 1`).

Static routes (`/export`, `/import`) are registered **before** `GET /:id` in the controller.

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
  }[];                   // ordered by `position`
  createdAt: string;     // ISO
  lastUsedAt: string | null; // ISO or null
}
```

`GET /workout-lists` returns `WorkoutList[]`. `DELETE` returns `{ result: boolean }`.

### Export / import file format (`WorkoutListsExportFile`)

Source of truth: server DTO `WorkoutListsExportFile`. Client mirrors types for API calls and file download.

```typescript
{
  formatVersion: 1;
  app: 'set-forge';
  exportedAt: string;   // ISO
  workoutLists: {
    name: string;
    description: string;
    exercises: {
      name: string;
      muscleGroup: MuscleGroup;
      weight: number;
      reps: number;
      sets: number;
    }[];
    createdAt?: string;      // metadata only, not applied on import
    lastUsedAt?: string | null;
  }[];
}
```

- **Export** (`GET /workout-lists/export`): server calls `exportAll(userId)` → all owned lists → `toExportFile()` strips `id` (templates carry no progress).
- **Import** (`POST /workout-lists/import`): validates `formatVersion`; maps items to `CreateWorkoutListRequest.Dto[]`; creates all lists in **one DB transaction**; duplicate names allowed.
- **Legacy import**: bare `WorkoutList[]` array (localStorage v0) accepted and normalized to the envelope format before import.
- **Future single-list export**: `GET /workout-lists/:id/export` → same file shape with one item; service method `exportOne(userId, listId)`.

Import response:

```typescript
{ importedCount: number; lists: WorkoutList[] }
```

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
| `position` | INTEGER | not null — preserves exercise order |

> `completed_sets` was removed from `workout_exercises` (migration `20260630130000`). Progress now lives only on `workout_session_exercises`.

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
  }[];                   // @IsArray, @ArrayMinSize(1), @ValidateNested({ each: true })
}

// UpdateWorkoutListRequest.Dto
{
  name: string;
  description: string;
  exercises: (CreateExercise & { id?: string })[]; // @ArrayMinSize(1)
}
```

- `exercises` must contain **at least one** entry on create and update (`@ArrayMinSize(1)`); empty arrays return `400`.

- Existing exercises carry `id`; new exercises omit `id`.
- On update the server reconciles: keep existing by `id` (so an active session can resync against a stable `sourceExerciseId`), insert new (generate `id`), delete omitted. `position` follows array order.

---

## Service behaviour

`WorkoutListsService` (injects both models via `@InjectModel`):

- `getAll(userId)`: lists for user, exercises ordered by `position`, mapped to `WorkoutList`.
- `getOne(userId, id)`: single list; throws `NotFoundException` when missing or not owned.
- `create(userId, dto)`: create list + exercises in a transaction; `createdAt = now`, `lastUsedAt = null`.
- `update(userId, id, dto)`: ownership check, then reconcile exercises (see DTOs); returns updated list.
- `remove(userId, id)`: ownership check, delete (cascade removes exercises); returns `{ result: true }`.
- `exportAll(userId)`: `getAll` → `toExportFile(lists)` → `WorkoutListsExportFile`.
- `exportOne(userId, listId)` *(future)*: `getOne` → `toExportFile([list])`.
- `toExportFile(lists)`: shared serializer; strips ids; sets `exportedAt = now`.
- `importAll(userId, file)`: normalize legacy array if needed; validate; map to create DTOs; one transaction calling create logic per list; returns `{ importedCount, lists }`. On any failure — rollback, `BadRequestException`.

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
  - `useExportAllWorkoutListsMutation()` — `GET /workout-lists/export`; client triggers file download (`set-forge-workout-lists-YYYY-MM-DD.json`).
  - `useImportWorkoutListsMutation()` — `POST /workout-lists/import`; invalidates `workoutQueryKeys.lists` on success.
- API functions in `workout-list-api.ts`: `exportAllWorkoutLists()`, `importWorkoutLists(file)`; reserved name `exportWorkoutList(id)` for future `GET /:id/export`.
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
| `useExportAllWorkoutListsMutation()` | hook | Export all lists (`GET /workout-lists/export`) |
| `useImportWorkoutListsMutation()` | hook | Import file (`POST /workout-lists/import`) |
| `workoutQueryKeys.lists` | query key | Lists cache |
| `workoutQueryKeys.detail(id)` | query key | Detail cache |
| Routes | — | `/workout-lists`, `/workout-lists/export`, `/workout-lists/import`, `/workout-lists/:id`; reserved: `/workout-lists/:id/export` |

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Unauthenticated request | `JwtAuthGuard`/`RefreshTokenGuard` → 401 envelope |
| `:id` not owned / missing | `NotFoundException` → 404 envelope; client `useWorkoutQuery` resolves `null` |
| Invalid create/update DTO | `class-validator` → 400 envelope with messages |
| Empty `exercises` array on create/update | `@ArrayMinSize(1)` → 400 envelope |
| `sets === 0` | Disallowed by validation (`@Min(1)`) |
| Update removes an exercise | Exercise row deleted; `position` recomputed from array order |
| Update adds an exercise | New row, generated `id` |
| Update keeps an exercise | `id` preserved (lets an active session resync against it) |
| Delete cascade | Removing a list deletes its `workout_exercises` rows |
| Network/API error in mutation | Mutation error; create/update data layers return `false`; navigation does not run |
| Reload (no in-memory token) | `apiRequest` refresh flow restores session; queries refetch from server |
| Export with zero lists | `GET /export` returns file with `workoutLists: []`; client disables export button when list count is 0 |
| Import invalid file | 400 envelope; transaction rolled back, no partial import |

### Tests

- Unit: service, controller, DTO validation (`CreateWorkoutListRequest`, `UpdateWorkoutListRequest` — including empty `exercises`).
- E2E (`server/test/e2e/workout-lists-sessions.e2e-spec.ts`): create/update with empty exercises → `400`.
| Import legacy localStorage array | Server normalizes v0 array to export format before create |
| Import duplicate list names | All items created (append semantics) |
