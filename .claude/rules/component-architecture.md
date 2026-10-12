---
description: Component architecture — data / logic / presentation layers, arrow-function components, where hooks go
paths:
  - "client/**"
---

# Component Architecture

Every component in a `ui` segment is split by role into data, logic and presentation layers; the file suffix is the
role.

## Code style

- Arrow functions + `FC<Props>` + default export at the end. Props and children: see component-typing.
- TS imports: see fsd-architecture. SCSS imports: see styling-guidelines.

## 3-layer pattern

| Layer | File | Holds | Must not |
|---|---|---|---|
| Data | `*-data-layer.tsx` | TanStack Query hooks, Zustand stores, entity and feature hooks; passes data and callbacks down | business logic (`useCallback` / `useMemo` for stable references are fine) |
| Logic | `*-logic-layer.tsx` | state, handlers, effects, React / router / UI hooks (`useConfirm`, `useMainTabSwipe`) | call or import query/mutation hooks, stores, hooks of `@entities/*` / `@features/*` |
| Presentation | `*.tsx` | markup from props | call or import any hook — router, swipe and DOM hooks included: the logic layer calls them and passes the result (`swipeRef`, `activeItemId`) |

- Context providers (`*-provider.tsx`) own state like a data layer.
- A logic layer may render something other than its presentation (`null` while loading, a `NotFoundMessage`).

```typescript
// Data: useWorkoutListsQuery(); return <LogicLayer workoutLists={data ?? []} ... />;
// Logic: useState, handleSubmit; return <Presentation {...} />;
// Presentation: pure props, className={classes.form}
```

- Export from the slice `index.ts`: `export { default as X } from './ui/x-data-layer'`. No data layer → export the
  logic layer; no logic layer → export the presentation.
- **Skip layers:** no server/client async state → no data layer; no state → no logic layer; simple → presentation only.

## Actions in flight

A control that sends a request shows it one way across the app; the logic layer owns it.

- `useProgress()` (`@shared/lib`) runs the request: a second press is ignored at once, the indicator shows after
  300 ms and stays at least 500 ms. `progressOf(key)` goes to the control's `progress` prop (`Button`,
  `IconButton`); actions that end each other (Log out / Delete account) share one `useProgress`, so one in flight
  locks the other; `busy` locks a form's fields.
- The flow goes on — navigates, toasts success — only after `run` resolves: `if (await run('save', task)) { … }`.
- A confirmed action passes its request as `onConfirm` / `onAlternate` to `useConfirm()`: the dialog stays open with
  its button in progress until the answer, and on a rejection (the action shows its own error first).
- A screen that loads shows its skeleton through `useLoadingPhase(isLoading)`: nothing for 300 ms, then at least
  500 ms of skeleton.
- Data layers pass the request, never its `isPending`.

## File naming

`component-name-data-layer.tsx`, `component-name-logic-layer.tsx`, `component-name.tsx`, `component-name.module.scss`
(kebab-case: see file-naming).

## Enforcement

| Rule | Checked by |
|---|---|
| Presentation files call and import no hooks | `npm run client:lint` · ESLint `no-restricted-syntax` · `client/linter/rules/ui-segment-rule.ts` |
| Logic layers call and import no query/mutation/store hooks and no entity/feature hooks | `npm run client:lint` · ESLint `no-restricted-syntax` · `client/linter/rules/ui-segment-rule.ts` |
| React Query only in `model` / `api`, never in a `ui` segment | `npm run client:lint` · ESLint `no-restricted-imports` · `client/linter/rules/fsd-imports-rule.ts` |
| Components are `const X: FC<Props>` with a default export | `npm run client:lint` · ESLint `no-restricted-syntax` · `client/linter/rules/ui-segment-rule.ts` |
| A data layer holds no business logic | ❌ review |
| Requests in flight go through `useProgress` / `useConfirm` actions / `useLoadingPhase`, not an ad-hoc `isPending` | ❌ review |
| The split into layers fits the component (not just renamed files) | ❌ review |
