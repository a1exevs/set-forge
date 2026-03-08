# Specification: Create Workout List Page

## Overview

Page for creating a new workout list: form with name, description fields and a dynamic list of exercises (name, muscleGroup, weight, reps, sets). Validation before save, navigation to home on success.

---

## Current Logic

### Initialization

1. `CreateWorkoutPageDataLayer` mounts.
2. Subscribes to `useWorkoutListStore.use.addWorkoutList()`.
3. Passes `onAddWorkoutList={addWorkoutList}` to `CreateWorkoutPageLogicLayer`.

### Form state

4. `useState`: `name`, `description`, `exercises` (array of `ExerciseFormData`).
5. `ExerciseFormData`: `tempId`, `name`, `muscleGroup`, `weight`, `reps`, `sets`.
6. When adding exercise: `crypto.randomUUID()` for `tempId`, defaults: `muscleGroup: 'chest'`, `weight: 0`, `reps: 10`, `sets: 3`.

### Exercise CRUD

7. `addExercise`: push new element to `exercises`.
8. `removeExercise(tempId)`: filter by `tempId`.
9. `updateExercise(tempId, field, value)`: `map` with field replacement for element with `tempId`.

### Validation and submit

10. `handleSubmit`:
    - `e.preventDefault()`.
    - `!name.trim()` → confirm dialog «Please enter a list name», return.
    - `exercises.length === 0` → confirm «Please add at least one exercise», return.
    - Check: `exercises.find(ex => !ex.name.trim() || ex.weight < 0 || ex.reps <= 0 || ex.sets <= 0)` → confirm «Please check exercise data validity», return.
11. Build DTO: `name.trim()`, `description.trim()`, `exercises` (without `tempId`; `id` and `completedSets` are added in store).
12. `onAddWorkoutList(dto)` → store creates `WorkoutList`, saves to storage, pushes to `workoutLists`.
13. `navigate({ to: '/' })`.

### Cancel

14. `handleCancel` → `navigate({ to: '/' })`.

### Render

15. Empty `exercises`: text «Add exercises to your list».
16. Non-empty: cards with Listbox for muscleGroup, inputs for name/weight/reps/sets, remove button.

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

### Props CreateWorkoutPage (Presentation)

```typescript
type Props = {
  name: string;
  description: string;
  exercises: ExerciseFormData[];
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAddExercise: () => void;
  onRemoveExercise: (tempId: string) => void;
  onUpdateExercise: (tempId, field, value) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};
```

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
| Dialogs | `useConfirm` |
| Muscle groups | `muscleGroupLabels`, `muscleGroups` from `@entities` |

### Patterns

- 3-layer: Data → Logic → Presentation
- Logic layer: all validation, navigation, form state
- Presentation: props only, controlled inputs

---

## Exposed API / Methods

### Do not break when extending

| API | Type | Description |
|-----|-----|----------|
| `useWorkoutListStore.use.addWorkoutList(dto)` | action | Create and save workout list |
| `muscleGroupLabels`, `muscleGroups` | constants | Dictionary and array of muscle groups |
| `useConfirm()` | hook | Confirm dialog |
| Route | — | `/create` |

### Public exports

- `CreateWorkoutPage` — default from `create-workout-page-data-layer.tsx`.

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| Empty name | Confirm «Please enter a list name», submit not executed |
| No exercises | Confirm «Please add at least one exercise» |
| Empty exercise name | Confirm «Please check exercise data validity» |
| `weight < 0` | Same validation |
| `reps <= 0`, `sets <= 0` | Same validation |
| `exercises.length === 0` in UI | Text «Add exercises to your list» |
| Error on `addWorkoutList` | Store writes to `state.error`, navigation still runs (user goes to home) |
| `Number(e.target.value)` for empty input | `NaN` — validation `weight < 0` does not catch `NaN`; `reps`/`sets` with `min="1"` constrain at HTML level |
| Cancel without changes | Navigate to `/` without saving |
