# Specification: Workout Sessions (entity + API)

## Overview

A workout session is a training run created as an independent snapshot of a [workout list](workout-list-api.spec.md). The workout list stays a pure template; the session owns the progress (`completedSets`) for one training. This separation enables the [Workout History](workout-history.spec.md) module and keeps history immune to later template edits or deletions.

This spec is delivered in stages:

- Stage 1 (this section + Data Model): Sequelize entities, tables and migration. Additive only — no endpoints, no behavior change to existing flows; `workout_exercises.completed_sets` is left untouched.
- Stage 2 (## API contract): `workout-sessions` controller + service (start/continue, finish, progress, resync).
- Stage 3: the client moves workout mode onto sessions; the template progress (`completed_sets`, `PATCH .../progress`, `POST .../reset`) is removed.
- Stage 4: history listing endpoint and page (see [workout-history.spec.md](workout-history.spec.md)).

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
| `started_at` | DATE | not null |
| `finished_at` | DATE | nullable — set when the session completes |

Indexes: `(user_id)`, `(workout_list_id, status)`.

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

- Models live in `server/src/workout-sessions/` and are exported via `server/src/workout-sessions/index.ts`.
- Registered in `SequelizeModule.forRoot({ models: [...] })` in `server/src/app.module.ts`.
- Path alias `@workout-sessions/*` added to `tsconfig.json`, Jest `moduleNameMapper`, and the ESLint import resolver.

---

## API contract

> Stage 2 — to be implemented. Endpoints will live under `/api/1.0/workout-sessions`, guarded by `JwtAuthGuard` + `RefreshTokenGuard`, user-scoped, using `ResponseInterceptor` / `HttpExceptionFilter` like `workout-lists`.

Planned endpoints:

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/workout-sessions` | Start or return the active session for `{ workoutListId }` (snapshot on create) |
| GET | `/workout-sessions/active?workoutListId=` | Active session for a list, or `null` |
| GET | `/workout-sessions/:id` | One owned session |
| PATCH | `/workout-sessions/:id/exercises/:exerciseId/progress` | +1 `completedSets` (clamped); auto-finish when all complete |
| POST | `/workout-sessions/:id/finish` | Finish early |
| POST | `/workout-sessions/:id/resync` | Re-snapshot from the linked list preserving `completedSets` by `sourceExerciseId` |
| GET | `/workout-sessions?status=completed&limit=&offset=` | Paginated history (Stage 4) |

---

## Tech Stack

| Area | Choice |
|------|--------|
| Server framework | NestJS 9, `@nestjs/sequelize`, `sequelize-typescript`, MySQL |
| Schema | `sequelize-cli` migrations, `synchronize: false` |
| Auth | `JwtAuthGuard` + `RefreshTokenGuard`, owner = `request.user.id` |
| Tests | Jest + `@nestjs/testing` |

---

## References

- [workout-list-api.spec.md](workout-list-api.spec.md) — template entity, DTO/Swagger conventions, ownership
- [workout-mode.spec.md](workout-mode.spec.md) — client workout mode (moves onto sessions in Stage 3)
- [workout-history.spec.md](workout-history.spec.md) — history listing + page (Stage 4)
- Models: `server/src/workout-sessions/workout-session.model.ts`, `server/src/workout-sessions/workout-session-exercise.model.ts`
- Migration: `server/database/migrations/20260630120000-workout-sessions.js`
