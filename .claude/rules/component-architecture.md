---
description: Component architecture — data / logic / presentation layers, where hooks go
paths:
  - "client/**"
---

# Component Architecture

Every component in a `ui` segment is split by role into data, logic and presentation layers; the file suffix is the
role.

## Code style

- Components, props and children are typed as component-typing says; default export at the end.
- TS imports: see fsd-architecture. SCSS imports: see styling-guidelines.

## 3-layer pattern

| Layer | File | Holds | Must not |
|---|---|---|---|
| Data | `*-data-layer.tsx` | TanStack Query hooks and Zustand stores (state-management), entity and feature hooks; passes data and callbacks down | business logic (`useCallback` / `useMemo` for stable references are fine) |
| Logic | `*-logic-layer.tsx` | state, handlers, effects, React / router / UI hooks (`useConfirm`, `useMainTabSwipe`) | call or import query/mutation hooks, stores, hooks of `@entities/*` / `@features/*` |
| Presentation | `*.tsx` | markup from props | call or import any hook — router, swipe and DOM hooks included: the logic layer calls them and passes the result (`swipeRef`, `activeItemId`) |

- Context providers (`*-provider.tsx`) own state like a data layer.
- The presentation renders every state of the component — blank, skeleton, empty, not found, error, closed — from
  props (`loadingPhase`, nullable data, `open`); the logic layer computes them and its render returns only its
  presentation, with no other return. So the states of a screen live in one place and every screen reads the same.
  A page with no markup of its own: its logic layer returns the one widget it composes the same way,
  unconditionally (`create-workout`).

```typescript
// Data: useWorkoutListsQuery(); return <LogicLayer workoutLists={data ?? []} ... />;
// Logic: useState, handleSubmit; return <Presentation {...} />;
// Presentation: pure props, className={classes.form}
```

- Export from the slice `index.ts`: `export { default as X } from './ui/x-data-layer'`. No data layer → export the
  logic layer; no logic layer → export the presentation.
- **Skip layers:** no server/client async state → no data layer; no state → no logic layer; simple → presentation
  only.

## Actions in flight

A control that sends a request shows it one way across the app; the logic layer owns it.

- The request goes through `useProgress` (`@shared/lib`), a confirmed one through the `onConfirm` / `onAlternate`
  of `useConfirm()`, a loading screen through `useLoadingPhase` — never an ad-hoc `isPending` from a data layer:
  the timing and the locks live in those hooks. The logic layer calls `useLoadingPhase`; the presentation draws the
  phase it passes.
- The flow goes on — navigates, closes, toasts success — only after `run` resolves, so the indicator is never
  cut short.

## File naming

`component-name-data-layer.tsx`, `component-name-logic-layer.tsx`, `component-name.tsx`, `component-name.module.scss`
(kebab-case: see file-naming).

## Enforcement

| Rule | Checked by |
|---|---|
| Presentation files call and import no hooks | `npm run client:lint` · ESLint `no-restricted-syntax` · `client/linter/rules/ui-segment-rule.ts` |
| Logic layers call and import no query/mutation/store hooks and no entity/feature hooks | `npm run client:lint` · ESLint `no-restricted-syntax` · `client/linter/rules/ui-segment-rule.ts` |
| Default export at the end of a component file | ❌ review |
| A data layer holds no business logic | ❌ review |
| Requests in flight go through `useProgress` / `useConfirm` actions / `useLoadingPhase`, not an ad-hoc `isPending` | ❌ review |
| The split into layers fits the component (not just renamed files) | ❌ review |
| A logic layer returns only its presentation; the states are drawn by the presentation | ❌ review |
