# Specification: Edit Workout List

## Overview

Ability to edit existing workout lists via dot-dot-dot menu (Edit/Delete) on Home page. Shared form widget for Create and Edit modes. Shared menu component. Edit is available from Home page.

---

## Current Logic

### Menu (Home page)

1. Each workout list card has a dot-dot-dot menu button in the top right corner (see [shared-components.spec.md](shared-components.spec.md)).
2. On click: context menu with two items — Edit (first), Delete (second).
3. **Edit**: `navigate({ to: '/edit/$id', params: { id } })`.
4. **Delete**: same flow as before — confirm dialog via `useConfirm()`, then delete mutation.

### Edit page flow

5. Route `/edit/$id` renders `EditWorkoutPage`.
6. `EditWorkoutPageDataLayer` receives `id` from route params, calls `useWorkoutQuery(id)`, `useActiveWorkoutSessionQuery(id)`, `useUpdateWorkoutListMutation()` and `useResyncWorkoutSessionMutation()`. Passes `workout`, `activeSessionId` (`activeSession?.id ?? null`) and a `resyncSession` callback to LogicLayer.
7. If `workout === undefined`: render nothing (loading).
8. If `workout === null`: render `NotFoundMessage` widget («Workout list not found» + «Back to Home»).
9. Otherwise: render `WorkoutListForm` widget with `mode="edit"`, `initialData={workout}`, `onSubmit`, `onCancel`.

### Form (Edit mode)

10. Form pre-filled: `name`, `description`, `exercises` from `initialData`.
11. Title: «Editing &lt;name&gt;» (e.g., «Editing Push Day»).
12. Submit button: «Save» (not «Create List»).
13. Validation: same as Create (name required, at least one exercise, valid exercise data).
14. On submit: `useUpdateWorkoutListMutation().mutateAsync({ id, dto })` → `PUT /workout-lists/:id`; the server reconciles exercises and returns the updated list; mutation updates `workoutQueryKeys.detail(id)` and `workoutQueryKeys.lists`. Data layer returns `Promise<true>` on success, `Promise<false>` on error.
15. On success (when awaited `updateWorkoutList` resolves `true`):
    - If there is an **active session** for this list (`activeSessionId !== null`), prompt via `useConfirm` («Also update the current session?», confirm «Update session» / cancel «Keep session»). If confirmed, call `resyncSession(activeSessionId)` → `POST /workout-sessions/:id/resync` (re-snapshots from the template, preserving each matching exercise's `completedSets` clamped to the new `sets`). Resync **never auto-finishes** the session even if clamping leaves it fully complete — it stays `active`, and workout mode finishes it on the next entry (with the celebration). See [workout-mode.spec.md](workout-mode.spec.md) item 13.
    - Then `navigate({ to: '/' })`. On error — no navigation.

### Cancel

16. `handleCancel` → `navigate({ to: '/' })`.

---

## Data Model

### UpdateWorkoutListDto (modified)

```typescript
type UpdateExerciseDto = Omit<WorkoutExercise, 'id'> & Partial<Pick<WorkoutExercise, 'id'>>;

interface UpdateWorkoutListDto {
  name: string;
  description: string;
  exercises: UpdateExerciseDto[];
}
```

- Existing exercises: include `id` from original (templates no longer carry `completedSets`).
- New exercises: omit `id` — the server generates it.
- Removed exercises: omit from array (the server deletes their rows).

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
| Server state | `@tanstack/react-query` (`useWorkoutQuery`, `useUpdateWorkoutListMutation`) |
| Form state | Local `useState` in widget Logic |
| UI | React 18, Headless UI (`Listbox`, `Menu`), SCSS Modules |
| Dialogs | `useConfirm` |

### Patterns

- 3-layer: Data (page) → Logic (widget/page) → Presentation (widget)
- FSD: pages/edit-workout, widgets/workout-list-form, widgets/not-found-message, shared/ui/menu-button

---

## Exposed API / Methods

### Do not break when extending

| API | Type | Description |
|-----|------|--------------|
| `useWorkoutQuery(id)` | hook | Load list from API (`GET /workout-lists/:id`); `null` when 404/not owned |
| `useActiveWorkoutSessionQuery(id)` | hook | Active session for the list (or `null`) — drives the resync prompt |
| `useUpdateWorkoutListMutation()` | hook | Update via `PUT /workout-lists/:id`; data layer maps to `Promise<boolean>` |
| `useResyncWorkoutSessionMutation()` | hook | Resync active session after edit (`POST /workout-sessions/:id/resync`) |
| `workoutQueryKeys.detail(id)` | query key | Single-list cache key |
| `MenuButton` | component | From [shared-components.spec.md](shared-components.spec.md) |
| Route | — | `/edit/$id` |

### Public exports

- `EditWorkoutPage` — default from `edit-workout-page-data-layer.tsx`.

---

## Edge Cases

| Scenario | Handling |
|---------|----------|
| Non-existent `id` on `/edit/$id` | `useWorkoutQuery` resolves `null`; render `NotFoundMessage`, Link to home |
| Loading | `workout === undefined` → render `null` |
| Empty name on submit | Confirm «Please enter a list name» |
| No exercises on submit | Confirm «Please add at least one exercise» |
| Invalid exercise data | Confirm «Please check exercise data validity» |
| Error on update mutation (API failure) | Data layer returns `false`, navigation does NOT run |
| `WorkoutListForm` with `mode="edit"` without `initialData` | Render `NotFoundMessage` inside widget |
| Cancel without changes | Navigate to `/` |
| New exercise in Edit mode | Omit `id` in DTO — server generates |
| Removed exercise in Edit mode | Omit from exercises array |
| Existing exercise updated | Preserve `id` |
| Active session exists on save | Prompt «Also update the current session?»; on confirm call resync, then navigate |
| No active session on save | No prompt; navigate straight to `/` |
| Resync prompt declined | Session left untouched; navigate to `/` |
