# Specification: Workout History (Stage 4)

## Overview

Workout History is the read-only log of finished trainings. Every completed [workout session](workout-sessions.spec.md) is an immutable snapshot (name, exercises, per-exercise `completedSets`/`sets`), so history stays accurate even after the source [workout list](workout-list-api.spec.md) is edited or deleted. Stage 4 adds:

- a paginated history endpoint on the workout-sessions controller (`GET /workout-sessions`);
- a **History** tab (between Home and Profile) and a `/history` page with infinite scroll and expandable session cards.

Requires an authenticated session (see [auth-session.spec.md](auth-session.spec.md)).

---

## API

Delivered as part of the workout-sessions module — full contract in [workout-sessions.spec.md](workout-sessions.spec.md#api-contract).

- `GET /workout-sessions?limit=&offset=` → `WorkoutHistoryResponse.Dto` = `{ items: WorkoutSessionResponse.Dto[]; total: number; hasMore: boolean }`.
- Returns only `status='completed'` sessions for `request.user.id`, newest first (`finishedAt DESC, startedAt DESC, id DESC`).
- `limit` 1–50 (default 20), `offset` ≥ 0 (default 0); invalid values → `400`. The service also clamps defensively.
- `total` is the full completed-session count (via `findAndCountAll({ distinct: true })`); `hasMore = offset + items.length < total`.
- Timestamps are `DATETIME(3)` (millisecond precision) so the `finishedAt` ordering is deterministic for stable pagination (defined in the create migration `20260630120000-workout-sessions.js`).

---

## Client page (`/history`)

### App header

1. `.headerTop`: [`BrandWordmark`](shared-components.spec.md#brandwordmark) with `title="History"`, and a right-side count `"{total} workout(s)"` when `total > 0`.

### List

1. **Loading** (initial fetch): centered "Loading history…".
2. **Error**: "Could not load your workout history" + hint.
3. **Empty** (`sessions.length === 0`): "No completed workouts yet" + "Finish a workout to see it here".
4. Otherwise a vertical list of **session cards**. Each card:
   - Header is a `<button aria-expanded>` (whole row tappable, `≥44px`): title = `workoutListName`, meta line = finished date (`Mmm D, YYYY`) + summary `"{completed}/{total} exercise(s) · {duration}"`, and a `ChevronDown` that rotates when open.
   - `completed` = exercises with `completedSets >= sets` (and `sets > 0`); `duration` = `finishedAt - startedAt` rounded to `min` / `h`+`min` (omitted when unavailable).
   - Expanded body (only when open): per-exercise rows — name + muscle-group badge (`muscleGroupLabels`), `"{weight} kg × {reps} reps"`, and `"{completedSets}/{sets}"` (highlighted `$success-color` when the exercise is fully done). Exercises keep server `position` order.

### Infinite scroll

1. A 1px `sentinel` div is rendered at the end of the list. The logic layer attaches an `IntersectionObserver`; when it intersects and `hasMore && !isFetchingNextPage`, it calls `fetchNextPage()`.
2. `isFetchingNextPage` shows a "Loading more…" row.
3. The observer effect re-runs on `sessions.length` / `hasMore` / `isFetchingNextPage` changes and disconnects on cleanup.

### Bottom navigation and swipe

1. Fixed bottom [`MainTabsBar`](../../client/src/widgets/main-tabs-bar/) — Home (`/`), **History** (`/history`, active), Profile (`/profile`).
2. `useTabSwipeNavigation({ tabs: MAIN_TAB_ROUTES, activePath })`: swipe **right** → Home, swipe **left** → Profile.
3. Tab order lives once in `widgets/main-tabs-bar/model/main-tab-routes.ts` (`MAIN_TAB_ROUTES`) and the item list (icons/labels) in `main-tabs-bar/ui/main-tabs-bar.tsx` (History icon = `lucide-react` `History`).

---

## Current Logic

### Initialization

1. `HistoryPageDataLayer` mounts.
2. Subscribes to `useCurrentUserQuery(true)` and `useWorkoutHistoryInfiniteQuery(Boolean(user))`.
3. Flattens `data.pages[].items` → `sessions`; `total` from `pages[0].total`; `hasMore` from `hasNextPage`.
4. Passes `sessions`, `total`, `isLoading`, `isError`, `isFetchingNextPage`, `hasMore`, `fetchNextPage` to the Logic layer.

### Logic layer

5. Owns the expand/collapse map (`expandedIds`) and the `IntersectionObserver` on the sentinel, and provides the `formatSessionDate` / `formatSummary` formatters. Renders the Presentation layer.

### Data fetching hook

6. `useWorkoutHistoryInfiniteQuery` (`@tanstack/react-query` `useInfiniteQuery`): `queryKey = workoutSessionQueryKeys.history(20)`, `queryFn = fetchWorkoutHistory(20, pageParam)`, `initialPageParam = 0`, `getNextPageParam = (last, all) => last.hasMore ? Σ items.length : undefined`.

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

### Client types (`@entities`)

```typescript
interface WorkoutHistoryPage {
  items: WorkoutSession[];
  total: number;
  hasMore: boolean;
}
```

`WorkoutSession` / `WorkoutSessionExercise` are shared with workout mode ([workout-sessions.spec.md](workout-sessions.spec.md)).

---

## Tech Stack

| Category | Technology |
|-----------|------------|
| Routing | TanStack Router (`/history`, protected) |
| Server state | `@tanstack/react-query` `useInfiniteQuery` |
| UI | `BrandWordmark`, `MainTabsBar`, SCSS Modules, `lucide-react` (`History`, `ChevronDown`) |
| Infinite scroll | `IntersectionObserver` on a sentinel |
| Swipe | `useTabSwipeNavigation`, `MAIN_TAB_ROUTES` |

### Patterns

- 3-layer: Data → Logic → Presentation.
- FSD: `pages/history`, `entities/workout-session`, `shared`, `widgets`.

---

## Exposed API / Methods

| API | Type | Description |
|-----|-----|----------|
| `GET /workout-sessions?limit=&offset=` | endpoint | Paginated completed-session history |
| `fetchWorkoutHistory(limit, offset)` | function | Client API wrapper → `WorkoutHistoryPage` |
| `useWorkoutHistoryInfiniteQuery(enabled)` | hook | Infinite (offset) history query |
| `workoutSessionQueryKeys.history(pageSize)` | function | React Query key |
| `HistoryPage` | component | `default` export of `history-page-data-layer.tsx` (router entry) |
| Route | — | `/history` (protected) |

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| Unauthenticated user | Root `beforeLoad` redirects to `/login`; query gated on `Boolean(user)` |
| No completed sessions | Empty state; no count badge |
| Only one page (`hasMore=false`) | No observer fetch; no "Loading more…" |
| Source list later deleted | Snapshot `workoutListName` + exercises still render (session is immutable) |
| Same-second finishes | `finishedAt` is `DATETIME(3)`, plus `id DESC` tiebreaker → stable order, no page skips/dupes |
| Invalid `limit`/`offset` | Endpoint responds `400` (DTO validation); service clamps as defense in depth |

---

## References

- [workout-sessions.spec.md](workout-sessions.spec.md) — session entity, endpoints, `getHistory`, DTOs, precision migration
- [home-page.spec.md](home-page.spec.md) / [profile-page.spec.md](profile-page.spec.md) — shared tab bar + swipe (now three tabs)
- [shared-components.spec.md](shared-components.spec.md) — `BrandWordmark`, `TabsBar`
- [workout-mode.spec.md](workout-mode.spec.md) — where sessions are created/finished
- Client: `client/src/pages/history/`, `client/src/entities/workout-session/`
- Server: `server/src/workout-sessions/` (`getHistory`, `dto/get-workout-history.query.ts`, `dto/workout-history.response.ts`)
