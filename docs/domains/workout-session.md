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

Each id is proven by the tests tagged `// @invariant workout-session/<id>`; `npm run client:lint` finds them.

| Id | Invariant |
|---|---|
| one-active-per-list | At most one active session per workout list; starting again returns the active one |
| snapshot-at-start | A session snapshots the list at start; later list edits don't change it until resync |
| exercise-complete | An exercise is complete when `completedSets >= sets` and it has sets — the same rule on server and client |
| progress-capped | Progress never exceeds the planned sets; the last set auto-finishes the session |
| resync-keeps-progress | Resync keeps progress per source exercise (clamped to the new sets) and never finishes the session itself |
| discard-not-in-history | Discard hard-deletes an active session; it never reaches history |
| history-completed-only | History holds completed sessions only, newest first, with a stable tiebreaker |
| list-delete-discards-active | Deleting a list discards its active session; completed sessions stay in history without the list |
| finish-on-entry-if-complete | Entering an already complete active session (after resync) finishes it once |
| optimistic-no-rewind | A slow progress response never rewinds optimistic progress — ❌ review (the merge keeps the higher `completedSets`, no test) |

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
| Models | `server/src/workout-sessions/workout-session.model.ts` · `server/src/workout-sessions/workout-session-exercise.model.ts` |
| HTTP contract | `server/src/workout-sessions/workout-sessions.controller.ts` (Swagger) |

## Related

- [Workout list](workout-list.md) — the template a session is taken from.
