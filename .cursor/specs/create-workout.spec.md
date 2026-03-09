# Specification: Create Workout List Page

## Overview

Page for creating a new workout list. Uses shared widget `workout-list-form` in Create mode. Form with name, description fields and a dynamic list of exercises (name, muscleGroup, weight, reps, sets). Validation before save, navigation to home on success.

---

## Current Logic

### Initialization

1. `CreateWorkoutPageDataLayer` mounts.
2. Subscribes to `useWorkoutListStore.use.addWorkoutList()`.
3. Passes `onSubmit` with callback that calls `addWorkoutList(dto)` and navigates to `/` on success.
4. Create page is a thin wrapper around `widgets/workout-list-form`; form logic lives in the widget.

### Form state (in WorkoutListForm widget)

5. `useState`: `name`, `description`, `exercises` (array of `ExerciseFormData`).
6. `ExerciseFormData`: `tempId`, `name`, `muscleGroup`, `weight`, `reps`, `sets`.
7. When adding exercise: `crypto.randomUUID()` for `tempId`, defaults: `muscleGroup: 'chest'`, `weight: 0`, `reps: 10`, `sets: 3`.

### Exercise CRUD

8. `addExercise`: push new element to `exercises`.
9. `removeExercise(tempId)`: filter by `tempId`.
10. `updateExercise(tempId, field, value)`: `map` with field replacement for element with `tempId`.

### Validation and submit

11. `handleSubmit`:
    - `e.preventDefault()`.
    - `!name.trim()` → confirm dialog «Please enter a list name», return.
    - `exercises.length === 0` → confirm «Please add at least one exercise», return.
    - Check: `exercises.find(ex => !ex.name.trim() || ex.weight < 0 || Number.isNaN(ex.weight) || ex.reps <= 0 || Number.isNaN(ex.reps) || ex.sets <= 0 || Number.isNaN(ex.sets))` → confirm «Please check exercise data validity», return.
12. Build DTO: `name.trim()`, `description.trim()`, `exercises` (without `tempId`; `id` and `completedSets` are added in store).
13. `onSubmit(dto)` → `addWorkoutList(dto)` in store creates `WorkoutList`, saves to storage, pushes to `workoutLists`. Returns `true` on success, `false` on error.
14. On success: `navigate({ to: '/' })`. On error: no navigation.

### Cancel

15. `handleCancel` → `navigate({ to: '/' })`.

### Render

16. Empty `exercises`: text «Add exercises to your list».
17. Non-empty: cards with Listbox for muscleGroup, inputs for name/weight/reps/sets, remove button.

---

## Data Model

### ExerciseFormData (local type)

```typescript
type ExerciseFormData = {
  tempId: string;
  name: string;
  muscleGroup: MuscleGroup;
  weight: number;
  reps: number;
  sets: number;
};
```

### CreateWorkoutListDto

```typescript
interface CreateWorkoutListDto {
  name: string;
  description: string;
  exercises: Omit<WorkoutExercise, 'id' | 'completedSets'>[];
}
```

### MuscleGroup

```typescript
type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
```

### Props WorkoutListForm (public API — Logic layer)

The widget exports its Logic layer. Public props for Create and Edit pages:

```typescript
type FormMode = 'create' | 'edit';

type Props = {
  mode: FormMode;
  initialData?: WorkoutList;  // required when mode='edit'
  onSubmit: (dto: CreateWorkoutListDto | UpdateWorkoutListDto) => void;
  onCancel: () => void;
};
```

Internal Presentation layer receives `title`, `submitButtonText`, `name`, `description`, `exercises`, handlers (`onNameChange`, `onDescriptionChange`, etc.) — these are derived inside the Logic layer.

### Transformation on save

- `tempId` is not passed to DTO.
- Store on `addWorkoutList`: for each exercise generates `id: crypto.randomUUID()`, adds `completedSets: 0`.

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Routing | TanStack Router (`useNavigate`) |
| State | Zustand (addWorkoutList), local useState in Logic |
| UI | React 18, Headless UI (`Listbox`), SCSS Modules |
| Dialogs | `useConfirm` — validation dialogs use `hideCancelButton: true`, `confirmationText: 'Ok'` |
| Muscle groups | `muscleGroupLabels`, `muscleGroups` from `@entities` |

### Patterns

- 3-layer: Data (page) → Logic (widget) → Presentation (widget)
- Form logic in `widgets/workout-list-form`; Create page is thin wrapper with `mode="create"`
- Logic layer: all validation, navigation, form state
- Presentation: props only, controlled inputs

---

## Exposed API / Methods

### Do not break when extending

| API | Type | Description |
|-----|-----|----------|
| `useWorkoutListStore.use.addWorkoutList(dto)` | action | Create and save workout list; returns `true` on success, `false` on error |
| `muscleGroupLabels`, `muscleGroups` | constants | Dictionary and array of muscle groups |
| `useConfirm()` | hook | Confirm dialog |
| `WorkoutListForm` | widget | From `widgets/workout-list-form` |
| Route | — | `/create` |

### Public exports

- `CreateWorkoutPage` — default from `create-workout-page-data-layer.tsx`.

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| Empty name | Confirm «Please enter a list name» (`hideCancelButton: true`), submit not executed |
| No exercises | Confirm «Please add at least one exercise» (`hideCancelButton: true`) |
| Empty exercise name | Confirm «Please check exercise data validity» (`hideCancelButton: true`) |
| `weight < 0` | Same validation |
| `reps <= 0`, `sets <= 0` | Same validation |
| `exercises.length === 0` in UI | Text «Add exercises to your list» |
| Error on `addWorkoutList` | Store writes to `state.error`, `addWorkoutList` returns `false`, navigation does NOT run |
| `Number(e.target.value)` for empty input | `NaN` is caught via `Number.isNaN()` checks for `weight`, `reps`, `sets` |
| Cancel without changes | Navigate to `/` without saving |
