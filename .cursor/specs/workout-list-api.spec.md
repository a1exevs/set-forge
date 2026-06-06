# Specification: Workout List API (server + client integration)

## Overview

Backend REST API for the full Workout List lifecycle (create, read, update, delete, run in workout mode), replacing the client-side `localStorage` persistence. Implemented as a NestJS `workout-lists` module (controller + service + Sequelize models) scoped to the authenticated user, documented in Swagger and covered by unit tests. The client keeps its `useWorkoutListStore` (Zustand) public API but is backed by this API instead of `localStorage`.

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

- New API service `entities/workout-list/api/workout-list-api.ts` using shared `apiRequest` (`auth: true`) + `ResultCodes`, mirroring `entities/session/api/session-api.ts`.
- `useWorkoutListStore` keeps its selector surface but actions become async and call the API:
  - `loadLists()` (replaces `loadFromStorage`): `GET /workout-lists` → `workoutLists`.
  - `addWorkoutList(dto): Promise<boolean>`: `POST` → push returned list.
  - `updateWorkoutList(id, dto): Promise<boolean>`: `PUT` → replace in state + sync `currentWorkout`.
  - `deleteWorkoutList(id): Promise<void>`: `DELETE` → remove from state.
  - `setCurrentWorkout(id): Promise<void>`: `GET /workout-lists/:id` → `currentWorkout` (null on 404).
  - `updateWorkoutProgress(listId, exerciseId): Promise<void>`: optimistic local `+1` for snappy double-tap, then `PATCH`; on error reload list / set `error`.
  - `resetAllProgress(listId): Promise<void>`: optimistic local zero, then `POST /reset`.
  - `getUsagePercentageAsync()`: retired — returns `0` (no localStorage quota with a backend); home storage-warning path removed.
- Initial load: replace the `localStorage` hydration in `__root.tsx` / home `useEffect` with `loadLists()` triggered when the session is authenticated (after `bootstrapSessionAndPrimeCache`).
- IDs are server-generated (UUID strings); the client no longer calls `crypto.randomUUID()` for list/exercise ids.

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
| Client | `apiRequest` wrapper, Zustand store (existing public API), TanStack Router pages |

---

## Exposed API / Methods (do not break)

| API | Type | Description |
|-----|------|-------------|
| `useWorkoutListStore.use.workoutLists()` | selector | List of workout lists |
| `useWorkoutListStore.use.currentWorkout()` | selector | Current workout |
| `useWorkoutListStore.use.loadLists()` | action | Load lists from API |
| `useWorkoutListStore.use.addWorkoutList(dto)` | action | Create via API; `Promise<boolean>` |
| `useWorkoutListStore.use.updateWorkoutList(id, dto)` | action | Update via API; `Promise<boolean>` |
| `useWorkoutListStore.use.deleteWorkoutList(id)` | action | Delete via API |
| `useWorkoutListStore.use.setCurrentWorkout(id)` | action | Load single list into `currentWorkout` |
| `useWorkoutListStore.use.clearCurrentWorkout()` | action | Clear `currentWorkout` |
| `useWorkoutListStore.use.updateWorkoutProgress(listId, exerciseId)` | action | +1 completedSets (optimistic + PATCH) |
| `useWorkoutListStore.use.resetAllProgress(listId)` | action | Zero completedSets (optimistic + POST) |
| Routes | — | `/workout-lists`, `/workout-lists/:id`, `/workout-lists/:id/reset`, `/workout-lists/:id/exercises/:exerciseId/progress` |

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Unauthenticated request | `JwtAuthGuard`/`RefreshTokenGuard` → 401 envelope |
| `:id` not owned / missing | `NotFoundException` → 404 envelope; client `setCurrentWorkout` sets `currentWorkout = null` |
| Invalid create/update DTO | `class-validator` → 400 envelope with messages |
| Progress when `completedSets === sets` | No increment, list returned unchanged |
| `sets === 0` | Disallowed by validation (`@Min(1)`) |
| Update removes an exercise | Exercise row deleted; `position` recomputed from array order |
| Update adds an exercise | New row, generated `id`, `completedSets: 0` |
| Update keeps an exercise | `id` preserved; `completedSets` preserved unless supplied |
| Delete cascade | Removing a list deletes its `workout_exercises` rows |
| Network/API error in store action | `state.error` set; create/update return `false`; navigation does not run |
| Reload (no in-memory token) | `apiRequest` refresh flow restores session; `loadLists` repopulates from server |
