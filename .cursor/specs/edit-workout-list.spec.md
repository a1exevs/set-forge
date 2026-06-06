# Specification: Edit Workout List

## Overview

Ability to edit existing workout lists via dot-dot-dot menu (Edit/Delete) on Home page. Shared form widget for Create and Edit modes. Shared menu component. Edit is available from Home page.

---

## Current Logic

### Menu (Home page)

1. Each workout list card has a dot-dot-dot menu button in the top right corner (see [shared-components.spec.md](shared-components.spec.md)).
2. On click: context menu with two items — Edit (first), Delete (second).
3. **Edit**: `navigate({ to: '/edit/$id', params: { id } })`.
4. **Delete**: same flow as before — confirm dialog via `useConfirm()`, then `deleteWorkoutList(id)`.

### Edit page flow

5. Route `/edit/$id` renders `EditWorkoutPage`.
6. `EditWorkoutPageDataLayer` receives `id` from route params, subscribes to `useWorkoutListStore.use.currentWorkout()`, `useWorkoutListStore.use.setCurrentWorkout()`, `useWorkoutListStore.use.updateWorkoutList()`, `clearCurrentWorkout`. In `useEffect` of `EditWorkoutPageLogicLayer` call `setCurrentWorkout(id)` (async, `GET /workout-lists/:id`), cleanup — `clearCurrentWorkout`.
7. If `currentWorkout === null`: render `NotFoundMessage` widget («Workout list not found» + «Back to Home»).
8. Otherwise: render `WorkoutListForm` widget with `mode="edit"`, `initialData={currentWorkout}`, `onSubmit`, `onCancel`.

### Form (Edit mode)

9. Form pre-filled: `name`, `description`, `exercises` from `initialData`.
10. Title: «Editing &lt;name&gt;» (e.g., «Editing Push Day»).
11. Submit button: «Save» (not «Create List»).
12. Validation: same as Create (name required, at least one exercise, valid exercise data).
13. On submit: `updateWorkoutList(id, dto)` → store calls `PUT /workout-lists/:id`; the server reconciles exercises and returns the updated list, which the store stores. Returns `Promise<true>` on success, `Promise<false>` on error.
14. On success (when awaited `updateWorkoutList` resolves `true`): `navigate({ to: '/' })`. On error — no navigation.

### Cancel

15. `handleCancel` → `navigate({ to: '/' })`.

---

## Data Model

### UpdateWorkoutListDto (modified)

```typescript
type UpdateExerciseDto = Omit<WorkoutExercise, 'id' | 'completedSets'> &
  Partial<Pick<WorkoutExercise, 'id' | 'completedSets'>>;

interface UpdateWorkoutListDto {
  name: string;
  description: string;
  exercises: UpdateExerciseDto[];
}
```

- Existing exercises: include `id` and `completedSets` from original.
- New exercises: omit `id` and `completedSets` — the server generates `id`, sets `completedSets: 0`.
- Removed exercises: omit from array (the server deletes their rows).

### Props EditWorkoutPage (Presentation)

Edit page uses `WorkoutListForm` widget. Page-level props flow from DataLayer.

### Props WorkoutListForm (shared widget)

```typescript
type FormMode = 'create' | 'edit';

type Props = {
  mode: FormMode;
  initialData?: WorkoutList;  // required when mode='edit'
  onSubmit: (dto: CreateWorkoutListDto | UpdateWorkoutListDto) => void;
  onCancel: () => void;
};
```

---

## Widgets

### workout-list-form

- **Location**: `widgets/workout-list-form/`
- **Layers**: Logic + Presentation (no Data layer; data passed from page).
- **Used by**: Create page (`mode="create"`), Edit page (`mode="edit"`).

### not-found-message

- **Location**: `widgets/not-found-message/`
- **Purpose**: Shared block «Not found» + link back (default «Back to Home»).
- **Used by**: Edit page, Workout mode page, WorkoutListForm.
- **Props**: `title: string` (required), `backToLink?: string` (default `/`), `backToLabel?: string` (default «Back to Home»).

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Routing | TanStack Router (`useParams`, `useNavigate`) |
| State | Zustand (`updateWorkoutList`), local useState in widget Logic |
| UI | React 18, Headless UI (`Listbox`, `Menu`), SCSS Modules |
| Dialogs | `useConfirm` |

### Patterns

- 3-layer: Data (page) → Logic (widget) → Presentation (widget)
- FSD: pages/edit-workout, widgets/workout-list-form, widgets/not-found-message, shared/ui/menu-button

---

## Exposed API / Methods

### Do not break when extending

| API | Type | Description |
|-----|------|--------------|
| `useWorkoutListStore.use.currentWorkout()` | selector | Current workout (set via setCurrentWorkout) |
| `useWorkoutListStore.use.setCurrentWorkout(id)` | action | Load list from API (`GET /workout-lists/:id`) into currentWorkout; on 404/not owned, sets `currentWorkout = null` (ensures NotFoundMessage when navigating to a non-existent edit id) |
| `useWorkoutListStore.use.clearCurrentWorkout()` | action | Clear on unmount |
| `useWorkoutListStore.use.updateWorkoutList(id, dto)` | action | Update via `PUT /workout-lists/:id`; returns `Promise<true>` on success, `Promise<false>` on error |
| `MenuButton` | component | From [shared-components.spec.md](shared-components.spec.md) |
| Route | — | `/edit/$id` |

### Public exports

- `EditWorkoutPage` — default from `edit-workout-page-data-layer.tsx`.

---

## Edge Cases

| Scenario | Handling |
|---------|----------|
| Non-existent `id` on `/edit/$id` | `setCurrentWorkout(id)` sets `currentWorkout = null` when API returns 404/not owned; render `NotFoundMessage`, Link to home |
| Empty name on submit | Confirm «Please enter a list name» |
| No exercises on submit | Confirm «Please add at least one exercise» |
| Invalid exercise data | Confirm «Please check exercise data validity» |
| Error on `updateWorkoutList` (API failure) | Store writes `state.error`, resolves `false`, navigation does NOT run |
| `WorkoutListForm` with `mode="edit"` without `initialData` | Render `NotFoundMessage` inside widget |
| Cancel without changes | Navigate to `/` |
| New exercise in Edit mode | Generate new `id`, `completedSets: 0` |
| Removed exercise in Edit mode | Omit from exercises array |
| Existing exercise updated | Preserve `id`, `completedSets` |
