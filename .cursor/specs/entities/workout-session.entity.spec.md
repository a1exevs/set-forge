# Entity: Workout Session

## Overview

A workout session is a training run — an independent snapshot of a [workout list](workout-list.entity.spec.md). The list stays a template; the session owns `completedSets` for one training. Completed sessions form immutable history (see [history-page](../pages/history-page.spec.md)).

Related entities: [user](user.entity.spec.md), [workout-list](workout-list.entity.spec.md), [workout-session-exercise](workout-session-exercise.entity.spec.md).

Tables: `workout_sessions` (this spec), `workout_session_exercises` → [workout-session-exercise.entity.spec.md](workout-session-exercise.entity.spec.md).

---

## Database

### workout_sessions

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK, default `UUIDV4` |
| `user_id` | INTEGER | FK → `users.id`, `ON DELETE CASCADE`, not null |
| `workout_list_id` | UUID | FK → `workout_lists.id`, `ON DELETE SET NULL`, nullable |
| `workout_list_name` | STRING | not null — snapshot at start |
| `status` | STRING | `'active' \| 'completed'`, default `'active'` |
| `started_at` | DATETIME(3) | not null |
| `finished_at` | DATETIME(3) | nullable — set on completion |

Indexes: `(user_id)`, `(workout_list_id, status)`.

Model: `server/src/workout-sessions/workout-session.model.ts`. Migration: `20260630120000-workout-sessions.js`.

### workout_session_exercises

See [workout-session-exercise.entity.spec.md](workout-session-exercise.entity.spec.md) for columns, invariants, and client types.

### Status

`SessionStatus = 'active' | 'completed'` — `SESSION_STATUS.ACTIVE`, `SESSION_STATUS.COMPLETED`.

---

## Invariants

- At most **one `active` session per workout list** (service-enforced).
- Session exercises are full snapshots; template edits do not mutate sessions unless `resync` is called. Details: [workout-session-exercise.entity.spec.md](workout-session-exercise.entity.spec.md).
- Exercise is **completed** when `completedSets === sets`.
- `resync` never auto-finishes — session stays `active` even if clamping leaves all sets complete.
- History queries only `status='completed'`, ordered `finishedAt DESC, startedAt DESC, id DESC`.
- `discard` hard-deletes an **active** session; it never appears in history.
- Deleting the source [workout list](workout-list.entity.spec.md) hard-discards an **active** session for that list via `discardActiveForList` (called from list `remove` before delete). **Completed** sessions remain in history with `workoutListId: null`.

---

## Server

### Location

`server/src/workout-sessions/` — models, service, controller, `dto/`, `constants/`

### Models

`workout-session.model.ts` — child model: [workout-session-exercise.entity.spec.md](workout-session-exercise.entity.spec.md)

### Module wiring

- `WorkoutSessionsModule` imports `WorkoutSession`, `WorkoutSessionExercise`, `WorkoutList`, `WorkoutExercise` + `AuthModule`
- Swagger: `Docs.WORKOUT_SESSIONS_CONTROLLER`
- Path alias: `@workout-sessions/*`
- Controller route order: `POST /`, `GET /` (history), `GET active`, then `PATCH`/`POST`/`DELETE` on `/:id/...`

---

## Client

### Location

`client/src/entities/workout-session/` — `api/workout-session-api.ts`, `model/use-workout-session-queries.ts`, `model/workout-session-query-keys.ts`, `model/types.ts`

### Types

```typescript
interface WorkoutSession {
  id: string;
  workoutListId: string | null;
  workoutListName: string;
  status: SessionStatus;
  startedAt: string;
  finishedAt: string | null;
  exercises: WorkoutSessionExercise[]; // see workout-session-exercise.entity.spec.md
}

type SessionStatus = 'active' | 'completed';

interface WorkoutHistoryPage {
  items: WorkoutSession[];
  total: number;
  hasMore: boolean;
}
```

Session exercise type: [workout-session-exercise.entity.spec.md](workout-session-exercise.entity.spec.md).

React Query keys: `workoutSessionQueryKeys` (`.forList`, `.active`, `.detail`, `.historyRoot`, `.history`). Mutations call `syncSessionCaches` to keep `forList`, `active` (null when status ≠ `active`), and `detail` in sync on start, increment, finish, and resync; `discard` removes `forList` and sets `active` to null. Finish and progress that returns `status: completed` (server auto-finish) invalidate `.historyRoot` so History refetches. List delete on home page calls `clearWorkoutSessionCachesForDeletedList` after the list mutation (logic layer).

---

## API contract

- Base: `/api/1.0`. Controller: `workout-sessions`.
- Auth: `JwtAuthGuard` + `RefreshTokenGuard`, scoped to `request.user.id`.
- Envelope: `CommonResponse`.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/workout-sessions` | Start or resume active session (`200` resume / `201` create). `400` empty list; `404` list missing |
| GET | `/workout-sessions/active?workoutListId=` | Active session or `null` in `data` |
| PATCH | `/workout-sessions/:id/exercises/:exerciseId/progress` | +1 `completedSets`; auto-finish when all complete |
| POST | `/workout-sessions/:id/finish` | Finish early; idempotent if already completed |
| POST | `/workout-sessions/:id/resync` | Re-snapshot from linked list; preserves progress by `sourceExerciseId` |
| DELETE | `/workout-sessions/:id` | Discard active session (hard delete + cascade exercises). `404` not found; `400` if not active. Does not appear in history |
| GET | `/workout-sessions?limit=&offset=` | Paginated completed history → `{ items, total, hasMore }` |

### Response (`WorkoutSessionResponse.Dto`)

Nested `exercises` shape: [workout-session-exercise.entity.spec.md](workout-session-exercise.entity.spec.md#api-contract).

```typescript
{
  id: string;
  workoutListId: string | null;
  workoutListName: string;
  status: 'active' | 'completed';
  startedAt: string;
  finishedAt: string | null;
  exercises: WorkoutSessionExercise[];
}
```

### DTOs

- `StartWorkoutSessionRequest`, `GetActiveWorkoutSessionQuery`, `GetWorkoutHistoryQuery`, `WorkoutSessionResponse`, `WorkoutHistoryResponse`

### Service behaviour

- `start` — idempotent resume or snapshot; stamps list `lastUsedAt` on create only; locks list row in transaction
- `incrementProgress` — active only; auto-finish when all exercises complete
- `finish` — idempotent complete
- `resync` — active only; rebuilds exercises; never auto-finishes
- `discard` — active only; hard-deletes session and cascaded exercises; not in history
- `discardActiveForList` — hard-deletes all active sessions for a list; used by list `remove`; accepts optional transaction
- `getHistory` — `limit` 1–50 (default 20), `offset` ≥ 0; `hasMore = offset + items.length < total`

---

## Exposed API / Methods

| API | Type | Description |
|-----|-----|-------------|
| `startWorkoutSession(listId)` | function | `POST /workout-sessions` |
| `fetchActiveWorkoutSession(listId)` | function | `GET /workout-sessions/active` |
| `fetchWorkoutHistory(limit, offset)` | function | `GET /workout-sessions` |
| `incrementSessionProgress(sessionId, exerciseId)` | function | `PATCH .../progress` |
| `finishWorkoutSession(sessionId)` | function | `POST .../finish` |
| `resyncWorkoutSession(sessionId)` | function | `POST .../resync` |
| `discardWorkoutSession(sessionId)` | function | `DELETE /workout-sessions/:id` |
| `clearWorkoutSessionCachesForDeletedList(qc, listId)` | function | Clears `active`, `forList`, and cached `detail` after list delete |
| `useActiveWorkoutSessionQuery(listId)` | hook | Workout mode phase detection; edit-page resync prompt |
| `useStartWorkoutSessionMutation()` | hook | Explicit start on workout mode preview |
| `useWorkoutHistoryInfiniteQuery(enabled)` | hook | History page infinite query |
| `useIncrementSessionProgressMutation()` | hook | Optimistic `PATCH .../progress` |
| `useFinishWorkoutSessionMutation()` | hook | `POST .../finish` |
| `useResyncWorkoutSessionMutation()` | hook | `POST .../resync` |
| `useDiscardWorkoutSessionMutation()` | hook | `DELETE /workout-sessions/:id` |
| `workoutSessionQueryKeys.all` / `.forList` / `.detail` / `.active` / `.historyRoot` / `.history` | keys | Query cache (see **Client** above) |

---

## Tests

- Unit: `workout-sessions.service.spec.ts`, `workout-sessions.controller.spec.ts`, `workout-sessions.model.spec.ts`, DTO specs
- E2E: `server/test/e2e/workout-lists-sessions.e2e-spec.ts` (discard flow; list delete discards active session, keeps completed history)
- Client: `entities/workout-session/api/specs/workout-session-api.spec.unit.ts`, `entities/workout-session/model/specs/clear-workout-session-caches-for-deleted-list.spec.unit.ts`

---

## Used by

- [workout-mode-page](../pages/workout-mode-page.spec.md)
- [history-page](../pages/history-page.spec.md)
- [edit-workout-page](../pages/edit-workout-page.spec.md) — resync prompt

---

## References

- [workout-list.entity.spec.md](workout-list.entity.spec.md)
- [workout-session-exercise.entity.spec.md](workout-session-exercise.entity.spec.md)
- Migrations: `20260630120000-workout-sessions.js`, `20260701120000-workout-sessions-datetime-precision.js`
