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
- `ui/specs/edit-workout-page-logic-layer.spec.unit.tsx`
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

1. Data layer: `useWorkoutQuery(id)`, `useActiveWorkoutSessionQuery(id)`, update + resync mutations. `updateWorkoutList` awaits `mutateAsync` and throws on failure (no boolean return).
2. Logic layer: while `workout === undefined` → render nothing (loading).
3. Logic layer handles submit, resync prompt, cancel, and toasts.

### Submit

4. If `activeSessionId` → confirm first («Also update the current session?») with **Cancel** / **Keep session** / **Update session**; save runs only after Keep or Update.
5. `PUT /workout-lists/:id` via `useUpdateWorkoutListMutation`. On failure: `toastError(..., 'Failed to update workout list')`; stay on page.
6. On success with Update session: `POST .../resync`. On resync failure: `toastError(..., 'Failed to update the current session')`; stay (list already saved). On Keep session: save only.
7. When update (and optional resync) succeed: `toastSuccess('Workout list updated')` → navigate `/`.

### Cancel

8. `navigate({ to: '/' })`.

---

## Data Model

### Props EditWorkoutPageLogicLayer

```typescript
type Props = {
  id: string;
  workout: WorkoutList | null | undefined;
  activeSessionId: string | null;
  updateWorkoutList: (id: string, dto: UpdateWorkoutListDto) => Promise<void>;
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

TanStack Router (`useParams`), React Query, Headless UI, extended `useConfirm` (alternate action), [`Toaster`](../shared/shared-components.spec.md#toaster) helpers, FSD `pages/edit-workout`, `widgets/`.

---

## Exposed API / Methods

| API | Type | Description |
|-----|-----|-------------|
| `EditWorkoutPage` | component | Default from data layer |

---

## Tests

- Unit: `edit-workout-page.spec.unit.tsx`, `edit-workout-page-logic-layer.spec.unit.tsx` — submit confirm (cancel / keep / update); success/error toasts; update vs resync failure messages
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
| Active session on save | Three-way resync prompt before save |
| Confirm Cancel | No save; stay on edit page |
| Confirm Keep session | Save list only; no resync; success toast; navigate home |
| Confirm Update session | Save list + `POST .../resync`; success toast; navigate home |
| Update API error | `toastError` (update message); no navigation |
| Resync API error after successful update | `toastError` (session message); no navigation |

---

## References

- [workout-list.entity.spec.md](../entities/workout-list.entity.spec.md)
- [workout-exercise.entity.spec.md](../entities/workout-exercise.entity.spec.md)
- [workout-session.entity.spec.md](../entities/workout-session.entity.spec.md)
- [user.entity.spec.md](../entities/user.entity.spec.md)
- [workout-mode-page.spec.md](workout-mode-page.spec.md)
- [home-page.spec.md](home-page.spec.md)
- [shared-components.spec.md](../shared/shared-components.spec.md#toaster)
