# Workout session

A workout session is one training run of a workout list. The list stays a template; the session is a snapshot of
its exercises that counts completed sets. Finished sessions form an immutable history.

## Glossary

- **Session** — one training run: `active` while training, `completed` once finished; never edited afterwards.
- **Session exercise** — a snapshot of a template exercise taken at start; its `completedSets` is the progress.
- **Complete exercise** — every planned set is done (`completedSets >= sets`, and it has sets).
- **Resync** — re-snapshot an active session from its list after the list was edited, keeping progress where the
  exercise still exists.
- **Discard** — drop an active session without saving it to history.

## Invariants

| Invariant | Checked by |
|---|---|
| At most one active session per workout list; starting again returns the active one | `server/src/workout-sessions/workout-sessions.service.spec.ts` |
| A session snapshots the list at start; later list edits don't change it until resync | `server/src/workout-sessions/workout-sessions.service.spec.ts` |
| An exercise is complete when `completedSets >= sets` and it has sets — the same rule on server and client | `server/src/workout-sessions/workout-sessions.service.spec.ts` · `client/src/entities/workout-session-exercise/model/specs/exercise-progress.spec.unit.ts` |
| Progress never exceeds the planned sets; the last set auto-finishes the session | `server/src/workout-sessions/workout-sessions.service.spec.ts` |
| Resync keeps progress per source exercise (clamped to the new sets) and never finishes the session itself | `server/src/workout-sessions/workout-sessions.service.spec.ts` |
| Discard hard-deletes an active session; it never reaches history | `server/src/workout-sessions/workout-sessions.service.spec.ts` |
| History holds completed sessions only, newest first, with a stable tiebreaker | `server/src/workout-sessions/workout-sessions.service.spec.ts` |
| Deleting a list discards its active session; completed sessions stay in history without the list | `server/src/workout-lists/workout-lists.service.spec.ts` · `client/src/entities/workout-session/model/specs/clear-workout-session-caches-for-deleted-list.spec.unit.ts` |
| Entering an already complete active session (after resync) finishes it once | `client/src/pages/workout-mode/ui/specs/workout-mode-page-logic-layer.spec.unit.tsx` |
| A slow progress response never rewinds optimistic progress | ❌ review (merge keeps the higher `completedSets`, no test) |

## Flows

### Training

1. Opening a list shows a preview; a session is created only on **Start workout**, never on mount.
2. A double tap on an exercise logs a set optimistically; requests are serialized and the server finishes the session
   on the last set (confetti on the client).
3. Early finish asks: **Finish** (save to history), **Discard** (drop, back to preview) or **Cancel**.
4. Coming back to a list with an active session resumes training; after completion a new start creates a new session.

### Editing a list during a session

Saving a list that has an active session asks whether to also update the session: **Update session** saves and
resyncs, **Keep session** saves only, **Cancel** saves nothing.

## Map

| Part | Code |
|---|---|
| Client entities | `client/src/entities/workout-session` · `client/src/entities/workout-session-exercise` |
| Screens | `client/src/pages/workout-mode` · `client/src/pages/history` |
| Server module (endpoints, rules) | `server/src/workout-sessions` |
| Server rules | `server/src/workout-sessions/workout-sessions.service.ts` |
| HTTP contract | `server/src/workout-sessions/workout-sessions.controller.ts` (Swagger) |

## Related

- [Workout list](workout-list.md) — the template a session is taken from.
