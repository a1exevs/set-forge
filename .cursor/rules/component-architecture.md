# Component Architecture Rules

## Code Style Requirements

### Arrow Functions Only

All components MUST use arrow functions with `FC` type and default export at the end:

```typescript
// ❌ WRONG - function declaration
export default function ComponentName() {
  return <div>Content</div>;
}

// ❌ WRONG - arrow function without FC type
const ComponentName = () => {
  return <div>Content</div>;
};

// ✅ CORRECT - arrow function with FC type and export at end
import { FC } from 'react';

const ComponentName: FC = () => {
  return <div>Content</div>;
};

export default ComponentName;
```

### Absolute Paths Only

ALL imports within the same layer MUST use absolute paths starting with `src/`:

```typescript
// ❌ WRONG - relative imports for TypeScript
import Component from './component';

// ✅ CORRECT - absolute paths for TypeScript
import Component from 'src/features/feature-name/ui/component';

// ✅ CORRECT - relative path for SCSS (exception)
import classes from './component.module.scss';
```

Cross-layer imports continue to use aliases:
```typescript
// ✅ CORRECT - cross-layer with aliases
import { Button } from '@shared';
import { Exercise } from '@entities';
```

### SCSS Imports - Exception to Absolute Path Rule

SCSS imports are the **ONLY exception** - they MUST use relative paths:

```typescript
// ✅ CORRECT - SCSS with relative path
import classes from './component-name.module.scss';

// ❌ WRONG - SCSS with absolute path
import classes from 'src/layer/slice/ui/component-name.module.scss';
```

**SCSS File Location:**
- SCSS module file MUST be placed in the same directory as the component
- File naming: `component-name.module.scss`

**Import naming:**
- Always import as `classes` (not `styles`) for better readability
- Usage: `className={classes.container}`

**Example - mixing TypeScript and SCSS imports:**
```typescript
// ✅ CORRECT - TypeScript with absolute path
import Component from 'src/features/feature-name/ui/component';
// ✅ CORRECT - SCSS with relative path (exception)
import classes from './component.module.scss';
```

**Reasoning:**
- Vite/Rollup requires relative paths for CSS/SCSS modules
- This is a build tool limitation, not a style choice

### Props Type Definition

**For local props (used only in this file):**
```typescript
import { FC } from 'react';

type Props = {
  name: string;
  onClick: () => void;
};

const Component: FC<Props> = ({ name, onClick }) => {
  return <div onClick={onClick}>{name}</div>;
};
```

**For components with children:**
```typescript
import { FC, PropsWithChildren } from 'react';

// Just children
const Component: FC<PropsWithChildren> = ({ children }) => {
  return <div>{children}</div>;
};

// Children + other props
type Props = PropsWithChildren<{
  someProp: string;
}>;

const Component: FC<Props> = ({ children, someProp }) => {
  return <div>{children}</div>;
};
```

**Use `type` for props, NOT `interface`:**
```typescript
// ❌ WRONG
interface ComponentProps {
  name: string;
}

// ✅ CORRECT
import { FC } from 'react';

type Props = {
  name: string;
};

const Component: FC<Props> = ({ name }) => {
  return <div>{name}</div>;
};
```

**Interfaces are ONLY for business entities:**
```typescript
// ✅ CORRECT - business entity
interface Exercise {
  id: string;
  name: string;
  createdAt: Date;
}
```

## 3-Layer Component Pattern

Every complex component MUST follow a 3-layer separation of concerns pattern.

### Layer 1: Data Layer (`*-data-layer.tsx`)

**Purpose:** Connect to stores, fetch data, manage subscriptions

**Rules:**
- Access Zustand stores using auto-selectors
- Pass data and actions as props to logic layer
- No business logic or hooks (except store selectors)
- Export as default

**Example:**
```typescript
// add-exercise-form-data-layer.tsx
import { FC } from 'react';
import { useExerciseStore } from '@entities';
import AddExerciseFormLogicLayer from 'src/features/add-exercise/ui/add-exercise-form-logic-layer';

const AddExerciseFormDataLayer: FC = () => {
  const addExercise = useExerciseStore.use.addExercise();
  const isLoading = useExerciseStore.use.isLoading();
  
  return <AddExerciseFormLogicLayer onAdd={addExercise} isLoading={isLoading} />;
};

export default AddExerciseFormDataLayer;
```

### Layer 2: Logic Layer (`*-logic-layer.tsx`)

**Purpose:** Handle hooks, state, event handlers, business logic

**Rules:**
- Use React hooks (useState, useEffect, useMemo, useCallback, etc.)
- Implement event handlers
- Manage local component state
- Transform data for presentation layer
- No store access (receive data via props)
- Export as default

**Example:**
```typescript
// add-exercise-form-logic-layer.tsx
import { FC, useState, FormEvent } from 'react';
import AddExerciseForm from 'src/features/add-exercise/ui/add-exercise-form';

type Props = {
  onAdd: (name: string, description: string) => void;
  isLoading: boolean;
};

const AddExerciseFormLogicLayer: FC<Props> = ({ onAdd, isLoading }) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  
  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onAdd(name, description);
    setName('');
    setDescription('');
  };
  
  return (
    <AddExerciseForm
      name={name}
      description={description}
      onNameChange={setName}
      onDescriptionChange={setDescription}
      onSubmit={handleSubmit}
      isDisabled={isLoading || !name.trim()}
    />
  );
};

export default AddExerciseFormLogicLayer;
```

### Layer 3: Presentation Layer (`*.tsx`)

**Purpose:** Pure presentational component

**Rules:**
- Only receives props
- No hooks (except potentially useMemo for expensive computations)
- No business logic
- Focuses on UI rendering
- Easy to test
- Export as default

**Example:**
```typescript
// add-exercise-form.tsx
import { ChangeEvent, FC, FormEvent } from 'react';
import { Button } from '@shared';
import classes from './add-exercise-form.module.scss';

type Props = {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  isDisabled: boolean;
};

const AddExerciseForm: FC<Props> = ({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onSubmit,
  isDisabled,
}) => {
  return (
    <form className={classes.form} onSubmit={onSubmit}>
      <input
        value={name}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => onNameChange(e.target.value)}
        placeholder="Exercise name"
      />
      <textarea
        value={description}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>): void => onDescriptionChange(e.target.value)}
        placeholder="Description"
      />
      <Button type="submit" disabled={isDisabled}>
        Add Exercise
      </Button>
    </form>
  );
};

export default AddExerciseForm;
```

## Component Export Pattern

### Segment Index Export

The data layer component is re-exported as the main component name:

```typescript
// src/features/add-exercise/ui/index.ts
export { default as AddExerciseForm } from './add-exercise-form-data-layer';
```

**Result:** Other modules import it as:
```typescript
import { AddExerciseForm } from '@features';
```

## When Layers Can Be Skipped

Not all components need all three layers:

### Skip Data Layer
When component doesn't access stores:
```typescript
// ui/index.ts
export { default as ComponentName } from 'src/layer/slice/ui/component-name-logic-layer';
```

### Skip Logic Layer
When component has no local state or complex logic:
```typescript
// component-name-data-layer.tsx
import { useStore } from '@entities';
import ComponentName from 'src/layer/slice/ui/component-name';

const ComponentNameDataLayer = () => {
  const data = useStore.use.data();
  return <ComponentName data={data} />;
};

export default ComponentNameDataLayer;
```

### Only Presentation Layer
For simple presentational components:
```typescript
// ui/index.ts
export { default as ComponentName } from 'src/layer/slice/ui/component-name';
```

## File Naming Convention

- Data layer: `component-name-data-layer.tsx`
- Logic layer: `component-name-logic-layer.tsx`
- Presentation: `component-name.tsx`
- Styles: `component-name.module.scss`
- Always use kebab-case for file names
- Component name matches the file name in PascalCase

## Styling

- Use SCSS modules for component styles
- One `.module.scss` file per component
- Import as `classes`: `import classes from './component-name.module.scss'`
- Use className: `className={classes.elementName}`

## TypeScript

- All components must use `FC<Props>` type annotation
- All props must be typed with `type` (NOT `interface` - interfaces only for business entities)
- All functions and callbacks must have explicit return types (including `void`)
- All inline callbacks in JSX must have explicit parameter and return types
- No `any` types allowed
- Use strict TypeScript mode
- Export types when needed by other modules
