# Specification: History Page

## Overview

Read-only log of completed workout sessions with infinite scroll and expandable session cards. Every completed session is an immutable snapshot — accurate even if the source [workout list](../entities/workout-list.entity.spec.md) is edited or deleted. Requires authenticated session ([user entity](../entities/user.entity.spec.md)).

Entity: [workout-session](../entities/workout-session.entity.spec.md); nested exercises: [workout-session-exercise](../entities/workout-session-exercise.entity.spec.md).

---

## Route

- Path: `/history` (protected)
- Router entry: `history-page-data-layer.tsx`
- Route file: `client/src/app/model/routes/history.tsx`

---

## Location

`client/src/pages/history/`

---

## Files

- `ui/history-page-data-layer.tsx`
- `ui/history-page-logic-layer.tsx`
- `ui/history-page.tsx`
- `ui/history-page-formatters.ts`
- `ui/history-page.module.scss`
- `ui/history-page.stories.tsx`
- `ui/specs/history-page.spec.unit.tsx`
- `ui/specs/history-page.spec.snap.tsx`
- `ui/specs/history-page-formatters.spec.unit.ts`
- `ui/index.ts`, `index.ts`

---

## UI

### App header

1. [`BrandWordmark`](../shared/shared-components.spec.md#brandwordmark) `title="History"`; count `"{total} workout(s)"` when `total > 0`.

### Main content

1. **Loading**: «Loading history…».
2. **Error**: «Could not load your workout history» + hint.
3. **Empty**: «No completed workouts yet» + «Finish a workout to see it here».
4. **Session cards**: header button (`aria-expanded`) — `workoutListName`, date (`Mmm D, YYYY`), summary `"{completed}/{total} exercise(s) · {duration}"`, `ChevronDown` rotates when open.
5. **Expanded**: per-exercise rows — name, muscle badge, weight/reps, `completedSets/sets` (success color when done).

### Infinite scroll

1. 1px sentinel at list end; «Loading more…» row while next page loads.

### Bottom navigation

1. [`MainTabsBar`](../../../client/src/widgets/main-tabs-bar/) — History tab active (Home / History / Profile).

---

## Current Logic

### Initialization

1. `HistoryPageDataLayer`: `useCurrentUserQuery(true)`, `useWorkoutHistoryInfiniteQuery(Boolean(user))`.
2. Flattens `data.pages[].items` → `sessions`; `total` from first page; `hasMore` from `hasNextPage`.

### Logic layer

3. `expandedIds` map; `formatSessionDate` / `formatSummary` from `history-page-formatters.ts`.
4. `IntersectionObserver` on sentinel → `fetchNextPage` when `hasMore && !isFetchingNextPage`.

### Tab swipe (presentation)

5. `HistoryPage` mounts `useTabSwipeNavigation` — swipe right → Home; swipe left → Profile.

### Data fetching

6. `useWorkoutHistoryInfiniteQuery`: `queryKey = workoutSessionQueryKeys.history(20)`, offset paging via `getNextPageParam`.

---

## Data Model

### Props HistoryPage (Presentation)

```typescript
type Props = {
  sessions: WorkoutSession[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  expandedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
  sentinelRef: RefObject<HTMLDivElement>;
  formatSessionDate: (iso: string | null) => string;
  formatSummary: (session: WorkoutSession) => string;
};
```

---

## API usage

| Method | Path | Hook |
|--------|------|------|
| GET | `/auth/me` | `useCurrentUserQuery` (gates history query) |
| GET | `/workout-sessions?limit=&offset=` | `useWorkoutHistoryInfiniteQuery` |

Full contract: [workout-session entity](../entities/workout-session.entity.spec.md#api-contract).

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Routing | TanStack Router |
| Server state | `useInfiniteQuery` |
| UI | SCSS Modules, `lucide-react` (`ChevronDown`) |
| Infinite scroll | `IntersectionObserver` |

---

## Exposed API / Methods

| API | Type | Description |
|-----|-----|-------------|
| `HistoryPage` | component | Default from `history-page-data-layer.tsx` |
| `formatSessionDate`, `formatSummary`, etc. | functions | `history-page-formatters.ts` |

---

## Tests

- Unit: `history-page.spec.unit.tsx`, `history-page-formatters.spec.unit.ts`
- Snapshot: `history-page.spec.snap.tsx`

---

## Storybook

- Title: `Pages/HistoryPage`
- File: `history-page.stories.tsx`

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| No completed sessions | Empty state; no count badge |
| `hasMore=false` | No observer fetch |
| Source list deleted | Snapshot name/exercises still render |
| Same-second finishes | `DATETIME(3)` + `id DESC` tiebreaker |
| Unauthenticated | Root redirect; query gated on user |

---

## References

- [workout-session.entity.spec.md](../entities/workout-session.entity.spec.md)
- [workout-session-exercise.entity.spec.md](../entities/workout-session-exercise.entity.spec.md)
- [workout-mode-page.spec.md](workout-mode-page.spec.md)
- [home-page.spec.md](home-page.spec.md)
- [shared-components.spec.md](../shared/shared-components.spec.md)
