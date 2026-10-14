---
description: React component typing — FC<Props>, named props types, typed inline JSX callbacks
paths:
  - "client/**"
---

# Component Typing

How React components, their props and their inline callbacks are typed.

## Components

- Every app component (`client/src`, outside `specs/` and `*.stories.tsx`) is an arrow function typed
  `const X: FC<Props>` (`FC` without props, `FC<PropsWithChildren>` for children); import `FC` from `react`.
- In `app/routes`, a file-route component that its `Route` references before it is defined
  (`component: LoginRoutePage`) is a `function` declaration below `Route`, typed by its return type (`ReactElement`)
  — a `const` there would be read before its initialization; an inline `component: (): JSX.Element =>` is fine
  too.
- Test and story code (`specs/`, `*.stories.tsx`, `client/.storybook/`) is outside this section, as the lint has it:
  its helpers — test components, `jest.mock` stubs, `render` / decorator / docs functions — are typed as they fit
  (stories: storybook).
- Props: `type Props = { ... }` (`type`, not `interface`: typescript-guidelines), never an inline object in
  `FC<{ ... }>`. A second component in the file gets its own `type XProps`.

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
| In `ui` segments every top-level `const` is typed `FC` / `FunctionComponent` and no function is declared | `npm run client:lint` · ESLint `no-restricted-syntax` · `client/linter/rules/ui-segment-rule.ts` |
| App components are `const X: FC` arrows with a named props type, a second component its own `type XProps`: in `ui` segments the arrow, the second type and an inline object nested in a generic (`FC<PropsWithChildren<{ … }>>` — the lint catches only `FC<{ … }>`), elsewhere all of it — except the `app/routes` file-route form | ❌ review |
