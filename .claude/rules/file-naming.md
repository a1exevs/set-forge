---
description: File naming — kebab-case everywhere, names by purpose in the client, route import names
paths:
  - "client/**"
  - "server/**"
---

# File Naming

All files and folders use **kebab-case** (lowercase with hyphens): consistent, safe on case-insensitive file systems,
the same convention as URLs and CSS classes.

## Files

```
✅ home-page.tsx, add-exercise-form.tsx, workout-list-store.ts, storage.service.ts, button.module.scss
❌ HomePage.tsx (PascalCase), addExerciseForm.tsx (camelCase), storageService.ts (camelCase)
```

TanStack Router exception: file routes use `__root.tsx` and the `$` prefix for params (`routes/workout/$id.tsx`).

## Route import names

Import variable names are concise and match the essence of the file, not the full path or the params:

```typescript
// ✅
import { Route as workoutRoute } from '../routes/workout/$id';
// ❌
import { Route as workoutIdRoute } from '../routes/workout/$id';
```

## Client: names by purpose

In `client/src` a file or folder is named after **what it is for**, not what kind of code it holds
(`workout-list.ts`, `format-date.ts`, `access-token-store.ts`, `swipe/`); the banned names: fsd-architecture §4.

- Tests: in a `specs/` folder, see fsd-architecture §4.
- Imports and public APIs: see fsd-architecture §5–§7.

## Enforcement

| Rule | Checked by |
|---|---|
| kebab-case in `client/src`, `client/tests`, `client/linter`, `client/scripts` (route files excepted) | `npm run client:lint` · `client/scripts/check-structure.ts` |
| kebab-case in `server/` | ❌ review |
| Route import names | ❌ review (the route tree is generated) |
