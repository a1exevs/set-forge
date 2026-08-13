# Specification: Create Workout List Page

## Overview

Creates a new workout list via shared `workout-list-form` widget (`mode="create"`). Entities: [workout-list](../entities/workout-list.entity.spec.md), [workout-exercise](../entities/workout-exercise.entity.spec.md). Requires authenticated session ([user](../entities/user.entity.spec.md)).

---

## Route

- Path: `/create` (protected)
- Router entry: `create-workout-page-data-layer.tsx`
- Route file: `client/src/app/model/routes/create.tsx`

---

## Location

`client/src/pages/create-workout/`

---

## Files

- `ui/create-workout-page-data-layer.tsx`
- `ui/create-workout-page-logic-layer.tsx` (thin — delegates to widget)
- `ui/create-workout-page.stories.tsx`
- `ui/specs/create-workout-page.spec.unit.tsx`
- `ui/specs/create-workout-page-data-layer.spec.unit.tsx`
- `ui/specs/create-workout-page-logic-layer.spec.unit.tsx`
- `ui/specs/create-workout-page.spec.snap.tsx`
- `ui/index.ts`, `index.ts`
- Form UI: `widgets/workout-list-form/`

---

## UI

### Main content

1. `WorkoutListForm` with `mode="create"`, title «New Workout List», submit «Create List».
2. Fields: name, description, dynamic exercise cards (Listbox muscle group, weight/reps/sets inputs, remove).
3. Empty exercises: «Add exercises to your list».
4. Cancel → home.

---

## Current Logic

### Initialization

1. `CreateWorkoutPageDataLayer`: `useCreateWorkoutListMutation()`; passes `onCreate(dto)` that awaits `mutateAsync(dto)`.
2. Logic layer `onSubmit` → `await onCreate(dto)` → `toastSuccess('Workout list created')` → navigate `/` on success; on failure `toastError(error, 'Failed to create workout list')` and stay.

### Form (widget logic)

3. Local state: `name`, `description`, `exercises` (`ExerciseFormData` with `tempId`).
4. Validation via `useConfirm` (name, ≥1 exercise, valid exercise fields).
5. DTO omits `tempId`; server assigns UUIDs.

---

## Data Model

### ExerciseFormData

```typescript
type ExerciseFormData = {
  tempId: string;
  name: string;
  muscleGroup: MuscleGroup;
  weight: number | null;
  reps: number | null;
  sets: number | null;
};
```

### Props CreateWorkoutPageLogicLayer

```typescript
type Props = {
  onCreate: (dto: CreateWorkoutListDto) => Promise<void>;
};
```

### WorkoutListForm props (discriminated union)

```typescript
type CreateProps = { mode: 'create'; onSubmit: (dto: CreateWorkoutListDto) => void; onCancel: () => void };
type EditProps = { mode: 'edit'; initialData?: WorkoutList; onSubmit: (dto: UpdateWorkoutListDto) => void; onCancel: () => void };
type Props = CreateProps | EditProps;
```

---

## API usage

| Method | Path | Hook |
|--------|------|------|
| POST | `/workout-lists` | `useCreateWorkoutListMutation` |

Full contract: [workout-list entity](../entities/workout-list.entity.spec.md#api-contract).

---

## Tech Stack

TanStack Router, `@tanstack/react-query`, Headless UI `Listbox`, `useConfirm`, [`Toaster`](../shared/shared-components.spec.md#toaster) helpers, `widgets/workout-list-form`.

---

## Exposed API / Methods

| API | Type | Description |
|-----|-----|-------------|
| `CreateWorkoutPage` | component | Default from data layer |
| `WorkoutListForm` | widget | `widgets/workout-list-form` |

---

## Tests

- Widget tests in `widgets/workout-list-form/specs/`
- Unit: `create-workout-page.spec.unit.tsx`, `create-workout-page-data-layer.spec.unit.tsx`, `create-workout-page-logic-layer.spec.unit.tsx` — success toast + navigate; error toast + stay; cancel
- Snapshot: `create-workout-page.spec.snap.tsx`

---

## Storybook

- Title: `Pages/CreateWorkoutPage`
- File: `create-workout-page.stories.tsx`

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| Empty name / no exercises / invalid exercise | Confirm dialog; no submit |
| API error on create | `toastError`; no navigation |
| Successful create | `toastSuccess`; navigate `/` |
| Cancel | Navigate `/` without save |

---

## References

- [workout-list.entity.spec.md](../entities/workout-list.entity.spec.md)
- [workout-exercise.entity.spec.md](../entities/workout-exercise.entity.spec.md)
- [user.entity.spec.md](../entities/user.entity.spec.md)
- [home-page.spec.md](home-page.spec.md)
- [edit-workout-page.spec.md](edit-workout-page.spec.md)
- [shared-components.spec.md](../shared/shared-components.spec.md#toaster)
