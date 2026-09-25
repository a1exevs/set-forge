# Workout list

A workout list is a user's reusable training template: an ordered set of exercises with weight, reps and sets. It
holds no progress — that belongs to a workout session. Lists can be exported to a JSON file and imported back.

## Glossary

- **Workout list** — a named template owned by one user.
- **Exercise** — a template row of a list: name, muscle group, weight, reps, sets; no progress.
- **Export file** — JSON with every list of the user, without ids and progress; the import format (a legacy
  localStorage array is accepted too).

## Invariants

| Invariant | Checked by |
|---|---|
| Lists are visible only to their owner; a foreign list is "not found" | `server/src/workout-lists/workout-lists.service.spec.ts` |
| A list has at least one exercise on create and update | `server/src/workout-lists/dto/create-workout-list.request.spec.ts` · `server/src/workout-lists/dto/update-workout-list.request.spec.ts` |
| Update keeps exercise ids (resync matches them), adds new ones, drops removed ones; order follows the array | `server/src/workout-lists/workout-lists.service.spec.ts` |
| Deleting a list deletes its exercises and discards its active session in one transaction | `server/src/workout-lists/workout-lists.service.spec.ts` |
| Export carries no ids and no progress; import creates all lists in one transaction | `server/src/workout-lists/workout-lists.service.spec.ts` |
| Client form stops a submit with an empty name, no exercises or invalid numbers | `client/src/widgets/workout-list-form/ui/specs/workout-list-form.spec.unit.tsx` |

## Flows

### Manage lists (Home)

1. Home shows the user's lists; **Edit** opens the editor, **Delete** asks for confirmation, then deletes the list and
   drops the cached sessions of that list.
2. **Export** downloads all lists; **Import** reads a file, asks for confirmation and adds the lists. Bad files and
   API errors show a toast, the page stays.

### Create / edit

The same form creates and edits a list. Editing a list with an active session asks about resync — see
[workout session](workout-session.md#editing-a-list-during-a-session).

## Map

| Part | Code |
|---|---|
| Client entities | `client/src/entities/workout-list` · `client/src/entities/workout-exercise` |
| Screens | `client/src/pages/home` · `client/src/pages/create-workout` · `client/src/pages/edit-workout` |
| Form | `client/src/widgets/workout-list-form` |
| Server module (endpoints, rules) | `server/src/workout-lists` |
| Server rules | `server/src/workout-lists/workout-lists.service.ts` |
| HTTP contract | `server/src/workout-lists/workout-lists.controller.ts` (Swagger) |

## Related

- [Workout session](workout-session.md) — training runs taken from a list.
