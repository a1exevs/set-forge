# TypeScript Guidelines

## Strict Mode

This project uses **TypeScript strict mode**. All the following rules are enforced:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "strictBindCallApply": true,
  "strictPropertyInitialization": true,
  "noImplicitThis": true,
  "alwaysStrict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "noPropertyAccessFromIndexSignature": true
}
```

## No `any` Types

**NEVER use `any` type**. Use proper typing instead.

### ❌ WRONG

```typescript
function processData(data: any) {
  return data.value;
}

const items: any[] = [];
```

### ✅ CORRECT

```typescript
function processData(data: { value: string }) {
  return data.value;
}

const items: Item[] = [];

// Or use generics
function processData<T extends { value: string }>(data: T) {
  return data.value;
}
```

### When You Don't Know the Type

Use `unknown` instead of `any`:

```typescript
// ❌ WRONG
function handleError(error: any) {
  console.log(error.message);
}

// ✅ CORRECT
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.log(error.message);
  }
}
```

## Type Definitions

### Interface vs Type

Prefer `interface` for object shapes, use `type` for unions/intersections:

```typescript
// ✅ Use interface for objects
interface Exercise {
  id: string;
  name: string;
  createdAt: Date;
}

// ✅ Use type for unions
type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';

// ✅ Use type for intersections
type ExerciseWithStats = Exercise & {
  totalSets: number;
  totalReps: number;
};
```

### Explicit Return Types

Always specify return types for ALL functions, including `void`:

```typescript
// ❌ WRONG - implicit return type
function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ WRONG - missing void return type
const handleClick = (e: MouseEvent) => {
  console.log('clicked');
};

// ✅ CORRECT - explicit return type
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ CORRECT - explicit void return type
const handleClick = (e: MouseEvent): void => {
  console.log('clicked');
};
```

### Component Props

**ALWAYS use `type` for component props, NOT `interface`:**

```typescript
// ❌ WRONG - using interface for props
interface ButtonProps {
  onClick?: () => void;
}

// ✅ CORRECT - using type for props
type Props = {
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};
```

**For local props, use simple name `Props`:**

```typescript
import { FC } from 'react';

// ✅ CORRECT - local props with FC
type Props = {
  name: string;
  onSubmit: () => void;
};

const Component: FC<Props> = ({ name, onSubmit }) => {
  // ...
};

export default Component;
```

**For components with children, use `PropsWithChildren` and `FC`:**

```typescript
import { FC, PropsWithChildren } from 'react';

// ✅ CORRECT - only children
const Wrapper: FC<PropsWithChildren> = ({ children }) => {
  return <div>{children}</div>;
};

// ✅ CORRECT - children + other props
type Props = PropsWithChildren<{
  title: string;
  onClose: () => void;
}>;

const Modal: FC<Props> = ({ children, title, onClose }) => {
  return (
    <div>
      <h2>{title}</h2>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

// ❌ WRONG - explicit children definition
type Props = {
  children: ReactNode;
  title: string;
};
```

**`interface` is ONLY for business entities:**

```typescript
// ✅ CORRECT - business entity
interface Exercise {
  id: string;
  name: string;
  createdAt: Date;
}

interface User {
  id: string;
  email: string;
  role: UserRole;
}
```

## Null Safety

Handle nullable values explicitly:

```typescript
// ❌ WRONG
function getExerciseName(exercise: Exercise | null) {
  return exercise.name; // Error: exercise might be null
}

// ✅ CORRECT
function getExerciseName(exercise: Exercise | null): string {
  return exercise?.name ?? 'Unknown';
}

// Or
function getExerciseName(exercise: Exercise | null): string {
  if (!exercise) {
    return 'Unknown';
  }
  return exercise.name;
}
```

## Array Access Safety

With `noUncheckedIndexedAccess`, array access returns `T | undefined`:

```typescript
const items: Exercise[] = [];

// ❌ WRONG - items[0] is Exercise | undefined
const first: Exercise = items[0];

// ✅ CORRECT
const first: Exercise | undefined = items[0];

// Or with null check
const first = items[0];
if (first) {
  console.log(first.name);
}

// Or with optional chaining
console.log(items[0]?.name);
```

## Generics

Use generics for reusable type-safe code:

```typescript
// ✅ CORRECT
function createStore<T>(initialValue: T): {
  get: () => T;
  set: (value: T) => void;
} {
  let value = initialValue;
  
  return {
    get: () => value,
    set: (newValue) => { value = newValue; },
  };
}

const numberStore = createStore(0);
const stringStore = createStore('hello');
```

## Type Exports

Export types from the same file where they're defined:

```typescript
// types.ts
export interface Exercise {
  id: string;
  name: string;
}

export type MuscleGroup = 'chest' | 'back' | 'legs';

// index.ts
export type { Exercise, MuscleGroup } from './types';
```

## Utility Types

Use built-in utility types:

```typescript
interface Exercise {
  id: string;
  name: string;
  description: string;
}

// Create without id
type CreateExerciseDto = Omit<Exercise, 'id'>;

// Make all optional
type PartialExercise = Partial<Exercise>;

// Make all required
type RequiredExercise = Required<PartialExercise>;

// Pick specific fields
type ExerciseSummary = Pick<Exercise, 'id' | 'name'>;

// Make readonly
type ReadonlyExercise = Readonly<Exercise>;
```

## Event Handlers

Type event handlers properly with explicit return types:

```typescript
import { FormEvent, ChangeEvent, MouseEvent } from 'react';

type FormProps = {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onButtonClick: (e: MouseEvent<HTMLButtonElement>) => void;
};

// In JSX, inline handlers must have explicit types
<input onChange={(e: ChangeEvent<HTMLInputElement>): void => setValue(e.target.value)} />
<button onClick={(): void => handleSubmit()}>Submit</button>
```

## Discriminated Unions

Use discriminated unions for complex state:

```typescript
type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Exercise[] }
  | { status: 'error'; error: string };

function handleState(state: LoadingState) {
  switch (state.status) {
    case 'idle':
      return 'Not started';
    case 'loading':
      return 'Loading...';
    case 'success':
      return state.data.length; // TypeScript knows data exists
    case 'error':
      return state.error; // TypeScript knows error exists
  }
}
```

## Type Guards

Create type guards for runtime checks:

```typescript
function isExercise(value: unknown): value is Exercise {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    typeof value.id === 'string' &&
    typeof value.name === 'string'
  );
}

function processValue(value: unknown) {
  if (isExercise(value)) {
    console.log(value.name); // TypeScript knows it's Exercise
  }
}
```

## Const Assertions

Use `as const` for literal types:

```typescript
// Without const assertion
const colors = ['red', 'blue', 'green']; // type: string[]

// With const assertion
const colors = ['red', 'blue', 'green'] as const; // type: readonly ["red", "blue", "green"]

// For objects
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} as const;
```

## Avoid Type Assertions

Minimize use of `as` type assertions:

```typescript
// ❌ AVOID
const value = someValue as SomeType;

// ✅ PREFER type guards or proper typing
if (isSomeType(someValue)) {
  const value = someValue; // TypeScript infers correct type
}
```

## ESLint TypeScript Rules

The project uses `@typescript-eslint` with strict rules. Follow ESLint suggestions.

## Summary

- **No `any` types** - use proper typing or `unknown`
- **Explicit return types** for all functions
- **Interface for objects**, type for unions/intersections
- **Handle null/undefined** explicitly
- **Use utility types** (Omit, Pick, Partial, etc.)
- **Type all props** with interfaces
- **Use type guards** for runtime checks
- **Const assertions** for literal types
- **Minimize type assertions** (`as`)
