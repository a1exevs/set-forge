# Specification: Workout Sessions (entity + API)

## Overview

A workout session is a training run created as an independent snapshot of a [workout list](workout-list-api.spec.md). The workout list stays a pure template; the session owns the progress (`completedSets`) for one training. This separation enables the [Workout History](workout-history.spec.md) module and keeps history immune to later template edits or deletions.

This spec is delivered in stages:

- Stage 1 (this section + Data Model): Sequelize entities, tables and migration. Additive only — no endpoints, no behavior change to existing flows; `workout_exercises.completed_sets` is left untouched.
- Stage 2 (## API contract): `workout-sessions` controller + service (start/continue, finish, progress, resync).
- Stage 3 (## Client integration): the client moves workout mode onto sessions; the template progress (`workout_exercises.completed_sets`, list `PATCH .../progress`, list `POST .../reset`) is removed (migration `20260630130000-drop-completed-sets-from-workout-exercises.js`).
- Stage 4 (delivered): history listing endpoint (`GET /workout-sessions`) and the `/history` page + tab (see [workout-history.spec.md](workout-history.spec.md)).

Aligns with [auth-session.spec.md](auth-session.spec.md) (envelope, base URL, guards) and [workout-list-api.spec.md](workout-list-api.spec.md) (ownership, DTO/Swagger conventions).

---

## Data Model (server)

Sequelize + MySQL, `synchronize: false` (schema via migration `20260630120000-workout-sessions.js`). Two tables.

### workout_sessions

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK, default `UUIDV4` |
| `user_id` | INTEGER | FK → `users.id`, `ON DELETE CASCADE`, not null |
| `workout_list_id` | UUID | FK → `workout_lists.id`, `ON DELETE SET NULL`, **nullable** (history survives list deletion) |
| `workout_list_name` | STRING | not null — name snapshot captured at session start |
| `status` | STRING | not null, default `'active'`, one of `active \| completed` |
| `started_at` | DATETIME(3) | not null — millisecond precision for stable history ordering |
| `finished_at` | DATETIME(3) | nullable — set when the session completes |

Indexes: `(user_id)`, `(workout_list_id, status)`. TODO: composite `(user_id, status, finished_at)` when history volume grows.

`@BelongsTo(() => WorkoutList)`, `@HasMany(() => WorkoutSessionExercise)`. `userId` is a `@ForeignKey(() => User)` (no reverse association, mirroring `WorkoutList`).

### workout_session_exercises

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK, default `UUIDV4` |
| `workout_session_id` | UUID | FK → `workout_sessions.id`, `ON DELETE CASCADE`, not null |
| `source_exercise_id` | UUID | nullable — links back to the template `workout_exercises.id` for resync |
| `name` | STRING | not null |
| `muscle_group` | STRING | not null, one of MuscleGroup |
| `weight` | FLOAT | not null, default `0` |
| `reps` | INTEGER | not null |
| `sets` | INTEGER | not null |
| `completed_sets` | INTEGER | not null, default `0` |
| `position` | INTEGER | not null — preserves exercise order |

Index: `(workout_session_id)`. `@BelongsTo(() => WorkoutSession)`.

### Status

`SessionStatus = 'active' | 'completed'` (`@workout-sessions/constants/session-status`). Constants: `SESSION_STATUS.ACTIVE`, `SESSION_STATUS.COMPLETED`, `SESSION_STATUSES`.

### Invariants

- At most **one `active` session per workout list** (enforced in the service layer in Stage 2; MySQL has no partial unique index).
- A session exercise is a **full snapshot**; editing or deleting the source list/exercise never mutates an existing session unless an explicit resync is requested (Stage 2/3).
- An exercise counts as **completed** when `completedSets === sets`.

---

## Module wiring

- Module lives in `server/src/workout-sessions/`: `workout-session.model.ts`, `workout-session-exercise.model.ts`, `workout-sessions.service.ts`, `workout-sessions.controller.ts`, `workout-sessions.module.ts`, `dto/`, `constants/`, exported via `index.ts`.
- `WorkoutSessionsModule` imports `SequelizeModule.forFeature([WorkoutSession, WorkoutSessionExercise, WorkoutList, WorkoutExercise])` + `AuthModule`; registered in `AppModule`.
- Models registered in `SequelizeModule.forRoot({ models: [...] })` in `server/src/app.module.ts`.
- Route segment `ENDPOINT_WORKOUT_SESSIONS` and Swagger copy live in `@common/constants` (`routes.ts`, `docs.ts`).
- Path alias `@workout-sessions/*` added to `tsconfig.json`, Jest `moduleNameMapper` (both `package.json` and `jest-e2e.json`), and the ESLint import resolver.

---

## API contract

- Base: same-origin `/api/1.0`. Controller segment: `workout-sessions`.
- All requests authenticated (`Authorization: Bearer <access>` + refresh cookie) and scoped to `request.user.id`.
- Responses follow `CommonResponse` (`{ data, messages, fieldsErrors, resultCode }`) via `ResponseInterceptor`; errors via `HttpExceptionFilter`.
- Guards: `JwtAuthGuard` + `RefreshTokenGuard`. Documented in Swagger (`@ApiTags('Workout sessions')`, `@ApiResult`).

### Endpoints

| Method | Path | Body / params | Description |
|--------|------|---------------|-------------|
| POST | `/workout-sessions` | `{ workoutListId }` (`StartWorkoutSessionRequest`) | Start or return the active session for the list. If an active session exists → returns it with **200** (idempotent resume); else snapshots the list into a new `active` session with **201** and stamps the list `lastUsedAt`. `404` if the list is missing/not owned; `400` if the list has no exercises. |
| GET | `/workout-sessions/active?workoutListId=` | `workoutListId` query (`GetActiveWorkoutSessionQuery`, `@IsUUID`) | Active session for a list, or `null` in `data`. `400` when `workoutListId` is missing/invalid. |
| GET | `/workout-sessions/:id` | `id` (UUID) | One owned session; `404` if missing/not owned. |
| PATCH | `/workout-sessions/:id/exercises/:exerciseId/progress` | `id`, `exerciseId` | +1 `completedSets` (clamped to `sets`). When every exercise reaches `sets`, the session **auto-finishes** (`status=completed`, `finishedAt=now`). `400` if the session is not active; `404` if the exercise is missing. |
| POST | `/workout-sessions/:id/finish` | `id` (UUID) | Finish early: sets `status=completed`, `finishedAt=now` when active; no-op (returns as-is) when already completed. |
| POST | `/workout-sessions/:id/resync` | `id` (UUID) | Re-snapshot the active session from its linked list, preserving `completedSets` by `sourceExerciseId` (clamped to new `sets`); new exercises start at 0, removed ones dropped; `workoutListName` refreshed. **Never auto-finishes** — even when clamping leaves every set complete the session stays `active` (resync runs off-screen while editing the list; the session is finished explicitly from workout mode so the user sees the completed session + celebration). `400` if not active, no linked list, or list missing. |
| GET | `/workout-sessions?limit=&offset=` | `limit` (1–50, default 20), `offset` (≥0, default 0) query (`GetWorkoutHistoryQuery`) | Paginated **completed** session history, newest first (`finishedAt DESC, startedAt DESC, id DESC`). Returns `{ items, total, hasMore }`. `400` when `limit`/`offset` are non-integers or out of range. |

The root `GET` (history) and the static `GET active` are registered **before** `GET /:id` in the controller so `/:id` never shadows them.

### Response payload (`data`)

`WorkoutSessionResponse.Dto` (the `active` endpoint may return `null`):

```typescript
{
  id: string;                 // UUID
  workoutListId: string | null;
  workoutListName: string;    // snapshot
  status: 'active' | 'completed';
  startedAt: string;          // ISO
  finishedAt: string | null;  // ISO or null
  exercises: {
    id: string;               // UUID (session exercise)
    sourceExerciseId: string | null;
    name: string;
    muscleGroup: MuscleGroup;
    weight: number;
    reps: number;
    sets: number;
    completedSets: number;
  }[];                        // ordered by position
}
```

### DTOs (namespace + Swagger pattern)

```typescript
// StartWorkoutSessionRequest.Dto
{ workoutListId: string; }    // @IsUUID

// GetActiveWorkoutSessionQuery.Dto
{ workoutListId: string; }    // @IsUUID (query)

// GetWorkoutHistoryQuery.Dto (query; @Type(() => Number))
{ limit?: number; offset?: number; }   // @IsOptional @IsInt @Min(1)/@Max(50) for limit, @Min(0) for offset

// WorkoutHistoryResponse.Dto
{ items: WorkoutSessionResponse.Dto[]; total: number; hasMore: boolean; }
```

### Service behaviour

`WorkoutSessionsService` injects `WorkoutSession`, `WorkoutSessionExercise`, `WorkoutList` via `@InjectModel`, and the connection via `@InjectConnection` (transactions for snapshot/resync/progress):

- `getOne(userId, id)`: owned session; `NotFoundException` if missing.
- `getActive(userId, workoutListId)`: active session for the list or `null`.
- `getHistory(userId, limit?, offset?)`: paginated **completed** sessions via `findAndCountAll` (`distinct: true`), ordered `finishedAt DESC, startedAt DESC, id DESC`. `limit` is clamped to `1..50` (default 20) and `offset` to `>= 0` (default 0) defensively in the service; returns `{ items, total, hasMore }` where `hasMore = offset + items.length < total`. Exercises are ordered by `position` in the mapper. Note `started_at`/`finished_at` are `DATETIME(3)` (millisecond precision, defined in the create migration `20260630120000-workout-sessions.js`) so `finishedAt` ordering is deterministic.
- `start(userId, workoutListId)`: ownership check on the list; return existing active session (`created: false`) or snapshot a new one (`created: true`, exercises copied in `position` order with `sourceExerciseId`, `completedSets=0`); stamp list `lastUsedAt` only on create. `BadRequestException` when the list has no exercises (defense in depth — create/update already require `exercises.length >= 1`). Concurrent starts are serialized by locking the `workout_lists` row inside a transaction.
- `incrementProgress(userId, sessionId, exerciseId)`: only on `active` (`BadRequestException` otherwise); `+1` if below `sets`; auto-finish when all exercises complete (exercise + session updates in one transaction).
- `finish(userId, sessionId)`: complete an active session; idempotent if already completed.
- `resync(userId, sessionId)`: active-only; rebuild exercises from the linked list preserving progress by `sourceExerciseId`; only `workoutListName` is patched on the session — it stays `active` regardless of completion (no auto-finish; workout mode finishes it on the next entry).

Ownership: all queries filter by `userId`; another user's session is treated as not found.

### Tests

- Unit: models, service (snapshot, progress, resync clamp + stays-active when fully complete, empty-list guard, history paging + `hasMore` + limit/offset clamp), controller (incl. `getHistory`), DTO validation (`GetActiveWorkoutSessionQuery`, `GetWorkoutHistoryQuery`).
- E2E (`server/test/e2e/workout-lists-sessions.e2e-spec.ts`): empty exercises on create/update, empty-list start guard, start/resume status codes, progress auto-finish, resync keeps the session active when reduced sets leave it fully complete, history returns completed sessions newest-first with pagination metadata + `offset` paging + `400` on invalid `limit`.

---

## Client integration (Stage 3)

- New entity `client/src/entities/workout-session/` (api + model), exported from `@entities`:
  - API (`api/workout-session-api.ts`, shared `apiRequest`): `startWorkoutSession(listId)` (`POST /workout-sessions`), `fetchActiveWorkoutSession(listId)`, `fetchWorkoutSession(id)`, `incrementSessionProgress(sessionId, exerciseId)`, `finishWorkoutSession(sessionId)`, `resyncWorkoutSession(sessionId)`.
  - Hooks (`model/use-workout-session-queries.ts`):
    - `useWorkoutSessionForListQuery(listId)` — start/resume on entering workout mode; `staleTime: Infinity`, `refetchOnWindowFocus: false`, `retry: false` (so a session is only created/resumed on mount/key change).
    - `useActiveWorkoutSessionQuery(listId)` — drives the edit-page resync prompt.
    - `useIncrementSessionProgressMutation()` — optimistic `+1` on `workoutSessionQueryKeys.forList(listId)`, then `PATCH`; server auto-finish reflected on success.
    - `useFinishWorkoutSessionMutation()` / `useResyncWorkoutSessionMutation()` — `POST .../finish` / `.../resync`, sync `forList` + `detail` caches, invalidate `active`; finish also invalidates `history`.
  - Query keys: `workoutSessionQueryKeys.{ forList(listId), detail(id), active(listId) }`.
- Workout mode (`pages/workout-mode`) runs on the session: start/resume on entry, double-tap → session progress, server auto-finish, and a bottom **Finish workout** button (disabled once completed). The **Reset** button and the list progress/reset hooks (`useUpdateWorkoutProgressMutation`, `useResetWorkoutProgressMutation`) and API are removed (see [workout-mode.spec.md](workout-mode.spec.md)).
- Edit flow (`pages/edit-workout`) prompts «Also update the current session?» when an active session exists, and calls resync on confirm (see [edit-workout-list.spec.md](edit-workout-list.spec.md)).
- Tests: `entities/workout-session/api/specs/workout-session-api.spec.unit.ts`; existing workout-list api/edit-page specs updated to drop progress/reset and `completedSets`.

---

## Tech Stack

| Area | Choice |
|------|--------|
| Server framework | NestJS 9, `@nestjs/sequelize`, `sequelize-typescript`, MySQL |
| Schema | `sequelize-cli` migrations, `synchronize: false` |
| Auth | `JwtAuthGuard` + `RefreshTokenGuard`, owner = `request.user.id` |
| Client | `apiRequest` wrapper, `@tanstack/react-query` hooks, TanStack Router pages |
| Tests | Jest + `@nestjs/testing` |

---

## References

- [workout-list-api.spec.md](workout-list-api.spec.md) — template entity, DTO/Swagger conventions, ownership
- [workout-mode.spec.md](workout-mode.spec.md) — client workout mode (runs on sessions as of Stage 3)
- [edit-workout-list.spec.md](edit-workout-list.spec.md) — edit flow + resync prompt
- [workout-history.spec.md](workout-history.spec.md) — history listing + page (Stage 4)
- Models: `server/src/workout-sessions/workout-session.model.ts`, `server/src/workout-sessions/workout-session-exercise.model.ts`
- Migrations: `server/database/migrations/20260630120000-workout-sessions.js`, `server/database/migrations/20260630130000-drop-completed-sets-from-workout-exercises.js`
- Client entity: `client/src/entities/workout-session/`
