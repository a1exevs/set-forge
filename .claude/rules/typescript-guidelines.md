---
description: TypeScript — strict mode, no any, explicit return types, interface vs type, curly braces, Node built-ins, Node scripts
paths:
  - "client/**"
  - "server/**"
  - "scripts/**"
  - "eslint.config.ts"
  - "lint-staged.config.cjs"
  - "package.json"
  - "docker-compose.yml"
---

# TypeScript Guidelines

Strict TypeScript in the client, the server and the repository scripts.

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

## Node built-ins

Node's own modules are imported with the `node:` scheme — `import { join } from 'node:path'`,
`const { existsSync } = require('node:fs')` — in TypeScript, CommonJS configs and inline `node -e` alike. They are part of Node, never
npm dependencies; the scheme says so at the import and no package of the same name can stand in for them.

Take what the file uses by name — `import { existsSync, readFileSync } from 'node:fs'`,
`const { join } = require('node:path')` — not the whole module (`import path from`, `import * as fs from`). A name
that clashes with a local one gets an alias (`resolve as resolvePath` next to a Promise's `resolve`). The one
exception is a spec that spies on the module: `jest.spyOn(fs, 'existsSync')` needs `import * as fs`.

## Node scripts

Repository scripts (`scripts/`, `client/scripts/`, the Playwright API stack) are TypeScript that Node runs as is —
`node scripts/check-domain-docs.ts`, no ts-node, no build. Node only strips the types, hence:

- erasable syntax only: no `enum` (an `as const` object + a union type), `namespace` or constructor parameter
  properties;
- ES modules: the folder resolves to a `"type": "module"` package.json; `import.meta.dirname` instead of
  `__dirname`;
- relative imports name the file with its extension (`./common.ts`); type-only imports use `import type`;
- no path aliases (`tests/...`, `@shared/...`): Node does not read `tsconfig.json`.

Node does not type-check either, so every script folder is covered by a `tsc` project that emits no code.

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
| Node built-ins via `node:` | `npm run lint:root` · `npm run client:lint` · `npm run server:lint` · ESLint `import/enforce-node-protocol-usage` |
| Node built-ins imported by name, `* as` only for `jest.spyOn` | ❌ review |
| `node:` where no linter reads: `server/database/config.js`, `server/.sequelizerc`, inline `node -e` (`package.json`, `docker-compose.yml`) | ❌ review |
| Node scripts: erasable syntax, strict types | `npm run lint:root` · `scripts/tsconfig.json` · `npm run client:lint` · `client/tsconfig.scripts.json` |
