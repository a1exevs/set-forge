---
description: TypeScript — strict mode, no any, explicit return types, interface vs type, curly braces
paths:
  - "client/**"
  - "server/**"
---

# TypeScript Guidelines

Strict TypeScript in the client and the server.

## Type safety

- Strict mode with all strict checks.
- Never `any`: use `unknown` + narrowing.
- Handle `null` / `undefined` explicitly (optional chaining, nullish coalescing, guards); array index access is
  `T | undefined` — check before use.
- Minimize `as` — prefer type guards (`value is T`) or proper typing; `as const` for literal types.

## Explicit return types

Named functions, hooks, methods and arrow functions assigned to a variable declare their return type, including
`void` — hooks too: `UseQueryResult<WorkoutList[]>`, `UseMutationResult<WorkoutList, Error, CreateWorkoutListDto>`.
Callbacks passed inline to a typed parameter get their types from it; inline JSX callbacks follow component-typing.

```typescript
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

## `interface` vs `type`

- `interface` — only for domain entities (`WorkoutList`, `WorkoutSession`), and in the client only in
  `client/src/entities/*/model/**`. Declaration merging (module augmentation in `app/router/router.ts`, ambient
  `*.d.ts` such as `vite-env.d.ts`) is the exception.
- `type` — everything else: DTOs and payloads, unions, intersections, props, view models, anything in `shared`.
  Doubt? It's a `type`.
- Public API files re-export types with `export type { X }` or inline `type X`; files are named by purpose, never
  `types.ts`.

## General practices

- Generics for reusable type-safe code; built-in utility types (`Omit`, `Pick`, `Partial`, `Required`, `Readonly`).
- Discriminated unions for complex state; explicit React event types (`FormEvent`, `ChangeEvent`, `MouseEvent`).

## Control flow

`if` / `else if` / `else` always use curly braces with the body on its own lines — never `if (x) foo();`.

```typescript
if (!value) {
  return;
}
```

## Enforcement

| Rule | Checked by |
|---|---|
| Strict mode | `npm run client:build` · `client/tsconfig.json` |
| No `any` (client) | `npm run client:lint` · ESLint `@typescript-eslint/no-explicit-any` |
| Curly braces | `npm run client:lint` · `npm run server:lint` · ESLint `curly` |
| Explicit return types (client) | `npm run client:lint` · ESLint `@typescript-eslint/explicit-function-return-type` · `client/linter/rules/return-type-rule.ts` |
| `interface` only in `entities/*/model` (client) | `npm run client:lint` · ESLint `@typescript-eslint/consistent-type-definitions` · `client/eslint.config.ts` |
| No `any`, explicit return types, `interface` vs `type` (server) | ❌ review (`no-explicit-any` is off in `server/eslint.config.ts` until the typing clean-up) |
| Minimal `as`, DTOs as `type` inside entity models | ❌ review |
