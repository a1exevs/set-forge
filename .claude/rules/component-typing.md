---
description: React component typing — FC<Props>, named props types, typed inline JSX callbacks
paths:
  - "client/**"
---

# Component Typing

How React components, their props and their inline callbacks are typed.

## Components

- **All** components use `FC<Props>` (or `FC<PropsWithChildren>` for children); import `FC` from `react`.
- Props: `type Props = { ... }` — never `interface`, never an inline object in `FC<{ ... }>`. A second component in
  the file gets its own `type XProps`.

```typescript
// ✅
const Component: FC<Props> = ({ name }) => <div>{name}</div>;
const Wrapper: FC<PropsWithChildren> = ({ children }) => <div>{children}</div>;
```

## Functions and callbacks

Explicit return types: see typescript-guidelines (Explicit return types).

## Inline callbacks in JSX

- **All** inline callbacks in JSX attributes have explicit parameter and return types.
- List render callbacks in JSX (`.map`, `.flatMap`) type their parameters; the return type is inferred JSX.

```typescript
// ✅
onChange={(e: ChangeEvent<HTMLInputElement>): void => setValue(e.target.value)}
onClick={(): void => doSomething()}
{items.map((item: Item) => <div key={item.id}>{item.name}</div>)}
```

## Enforcement

| Rule | Checked by |
|---|---|
| Inline JSX callbacks type parameters and return; list render callbacks type parameters | `npm run client:lint` · ESLint `no-restricted-syntax` · `client/linter/rules/return-type-rule.ts` |
| Props are a named type, not `FC<{ ... }>` (in `ui` segments) | `npm run client:lint` · ESLint `no-restricted-syntax` · `client/linter/rules/return-type-rule.ts` |
| Props are `type`, not `interface` | `npm run client:lint` · ESLint `@typescript-eslint/consistent-type-definitions` · `client/eslint.config.ts` |
| Every component is typed `FC<...>` | ❌ review (`ui` files reject untyped top-level consts, other files are not checked) |
