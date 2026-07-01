# Specification: Edit Workout List Page

## Overview

Edits an existing workout list at `/edit/$id` via `WorkoutListForm` (`mode="edit"`). After save, optionally resyncs an active [workout session](../entities/workout-session.entity.spec.md). Entry from [home-page](home-page.spec.md) card menu (Edit).

Entities: [workout-list](../entities/workout-list.entity.spec.md), [workout-exercise](../entities/workout-exercise.entity.spec.md), [workout-session](../entities/workout-session.entity.spec.md). Requires authenticated session ([user](../entities/user.entity.spec.md)).

---

## Route

- Path: `/edit/$id` (protected); `$id` = workout list UUID
- Router entry: `edit-workout-page-data-layer.tsx`
- Route file: `client/src/app/model/routes/edit/$id.tsx`

---

## Location

`client/src/pages/edit-workout/`

---

## Files

- `ui/edit-workout-page-data-layer.tsx`
- `ui/edit-workout-page-logic-layer.tsx`
- `ui/edit-workout-page.stories.tsx`
- `ui/specs/edit-workout-page.spec.unit.tsx`
- `ui/specs/edit-workout-page.spec.snap.tsx`
- `ui/index.ts`, `index.ts`
- Widgets: `workout-list-form`, `not-found-message`

---

## UI

### Main content

1. Not found (`workout === null`): `NotFoundMessage` («Workout list not found»).
2. Otherwise: `WorkoutListForm` — title «Editing \<name\>», submit «Save», pre-filled from `initialData`.

---

## Current Logic

### Initialization

1. Data layer: `useWorkoutQuery(id)`, `useActiveWorkoutSessionQuery(id)`, update + resync mutations.
2. Logic layer: while `workout === undefined` → render nothing (loading).
3. Logic layer handles submit, resync prompt, cancel.

### Submit

3. `PUT /workout-lists/:id` via `useUpdateWorkoutListMutation`.
4. On success: if `activeSessionId` → confirm «Also update the current session?» → optional `POST .../resync`.
5. Navigate `/` on success.

### Cancel

6. `navigate({ to: '/' })`.

---

## Data Model

### Props EditWorkoutPageLogicLayer

```typescript
type Props = {
  id: string;
  workout: WorkoutList | null | undefined;
  activeSessionId: string | null;
  updateWorkoutList: (id: string, dto: UpdateWorkoutListDto) => Promise<boolean>;
  resyncSession: (sessionId: string) => Promise<void>;
};
```

`UpdateWorkoutListDto` shape: [workout-list entity](../entities/workout-list.entity.spec.md#api-contract).

---

## API usage

| Method | Path | Hook |
|--------|------|------|
| GET | `/workout-lists/:id` | `useWorkoutQuery` |
| PUT | `/workout-lists/:id` | `useUpdateWorkoutListMutation` |
| GET | `/workout-sessions/active?workoutListId=` | `useActiveWorkoutSessionQuery` |
| POST | `/workout-sessions/:id/resync` | `useResyncWorkoutSessionMutation` |

Contracts: [workout-list](../entities/workout-list.entity.spec.md#api-contract), [workout-session](../entities/workout-session.entity.spec.md#api-contract).

---

## Tech Stack

TanStack Router (`useParams`), React Query, Headless UI, `useConfirm`, FSD `pages/edit-workout`, `widgets/`.

---

## Exposed API / Methods

| API | Type | Description |
|-----|-----|-------------|
| `EditWorkoutPage` | component | Default from data layer |

---

## Tests

- Unit: `edit-workout-page.spec.unit.tsx`
- Snapshot: `edit-workout-page.spec.snap.tsx`

---

## Storybook

- Title: `Pages/EditWorkoutPage`
- File: `edit-workout-page.stories.tsx`

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| Invalid `id` | `NotFoundMessage` |
| Active session on save | Resync prompt |
| Resync declined | Session unchanged; still navigate home |
| Update API error | No navigation |

---

## References

- [workout-list.entity.spec.md](../entities/workout-list.entity.spec.md)
- [workout-exercise.entity.spec.md](../entities/workout-exercise.entity.spec.md)
- [workout-session.entity.spec.md](../entities/workout-session.entity.spec.md)
- [user.entity.spec.md](../entities/user.entity.spec.md)
- [workout-mode-page.spec.md](workout-mode-page.spec.md)
- [home-page.spec.md](home-page.spec.md)
