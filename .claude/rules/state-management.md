---
description: State management — server state in TanStack Query hooks of entities, client-only UI state in Zustand
paths:
  - "client/**"
---

# State Management

Server state lives in TanStack Query hooks of entity models; Zustand holds client-only UI state.

## Server state — TanStack Query

All **server/async state** (session, workout lists, sessions) lives in `@tanstack/react-query` hooks under
`entities/*/model/use-*-queries.ts`.

- Query keys in `entities/*/model/*-keys.ts`; one key namespace per server resource.
- Data layers import hooks from the entity slice (`@entities/workout-list`); logic and presentation layers receive
  data via props (see component-architecture).
- Mutations handle cache updates (`setQueryData`, `invalidateQueries`) and optimistic updates (`onMutate`, rollback
  in `onError`). They never navigate — where the user goes next is the caller's flow.
- Request functions in `entities/*/api/` are internal to the hooks and not exported from the slice `index.ts`; tests
  mock the api file and read the mocks with `jest.requireMock`.
- A component needs the query client? Add a hook to the entity model (`useClearWorkoutSessionCachesForDeletedList`).

```typescript
// entities/workout-list/model/use-workout-queries.ts
export function useWorkoutListsQuery(enabled = true): UseQueryResult<WorkoutList[]> {
  return useQuery<WorkoutList[]>({ queryKey: workoutQueryKeys.lists, queryFn: fetchWorkoutLists, enabled });
}
```

## Client state — Zustand

Zustand only for **client-only UI state** (e.g. theme preference with `persist`), never for server data.

- Every store: `devtools(immer(...))` + `createSelectors`; `devtools` wraps `immer`; `{ name: 'StoreName' }` for DevTools.
- Auto-selectors: `useStore.use.data()`, not `useStore(s => s.data)`.
- Immer: mutate directly (`state.x = y`), no spread copies.
- Location: `entities/<name>/model/<purpose>-store.ts` for client-only entity state, `shared/lib/<purpose>/` for
  cross-cutting client state (`shared/lib/theme/theme-store.ts`).

```typescript
const useThemeStoreBase = create<ThemeState>()(devtools(immer(persist(/* ... */)), { name: 'ThemeStore' }));
export const useThemeStore = createSelectors(useThemeStoreBase);
```

## Single source of truth

- One Zustand store per client-only concern; no server state duplicated in Zustand.
- Derive computed values, don't store them; keep stores and query modules focused.

## Enforcement

| Rule | Checked by |
|---|---|
| Query hooks and stores only in data layers | `npm run client:lint` · ESLint `no-restricted-syntax` · `client/linter/rules/ui-segment-rule.ts` |
| React Query never imported in a `ui` segment | `npm run client:lint` · ESLint `no-restricted-imports` · `client/linter/rules/fsd-imports-rule.ts` |
| Request functions not exported from the entity public API | `npm run client:lint` · knip · `client/knip.jsonc` (unused exports fail) |
| Mutations don't navigate; store middleware and selectors pattern | ❌ review |
