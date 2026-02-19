# Set Forge - Workout Tracker

![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0-443e38)
![FSD](https://img.shields.io/badge/Architecture-FSD-blue)
![License](https://img.shields.io/badge/License-MIT-green)

A modern workout tracking application built with React, TypeScript, and Feature-Sliced Design architecture.

## 🚀 Technology Stack

### Core
- **React** 18.3+ - UI library
- **TypeScript** 5.7+ - Static typing with strict mode
- **Vite** 6.0+ - Build tool and dev server
- **Zustand** 5.0+ - State management with immer and devtools
- **SCSS Modules** - Scoped styling

### UI & Visualization
- **Headless UI** 2.2+ - Accessible UI components (wrapped for replaceability)
- **Recharts** 2.15+ - Charts for workout progress visualization

### Development
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules

## 📋 Requirements

- **Node.js**: 22.20.0
- **npm**: 10.9.3

## 🏗️ Architecture

This project follows **Feature-Sliced Design (FSD)** methodology, organizing code by business logic and responsibility layers.

### FSD Layers

```
src/
├── app/              # Application initialization, providers, global styles
├── pages/            # Page-level components (routing)
├── widgets/          # Composite UI blocks
├── features/         # User scenarios and business features
├── entities/         # Business entities and domain models
└── shared/           # Reusable code, UI kit, utilities
```

### Layer Hierarchy

Layers can only import from layers below them:
```
app → pages → widgets → features → entities → shared
```

### Segments

Each layer (except `shared`) contains **slices** (feature/entity names), which contain **segments**:

- `ui/` - UI components
- `model/` - Business logic, types, stores
- `api/` - API interactions

### Import Rules

**✅ Cross-layer imports (single-word aliases only):**
```typescript
import { Button, createSelectors } from '@shared';
import { Exercise, useExerciseStore } from '@entities';
import { AddExerciseForm } from '@features';
```

**❌ Nested path imports (forbidden):**
```typescript
// WRONG - don't do this
import { Button } from '@shared/ui';
import { useExerciseStore } from '@entities/exercise';
```

**✅ Intra-layer imports (full absolute paths):**
```typescript
import { AddExerciseFormLogicLayer } from 'src/features/add-exercise/ui/add-exercise-form-logic-layer';
```

### Public API Exports

Each layer has a root `index.ts` that re-exports all public APIs:

```typescript
// src/shared/index.ts
export * from './ui';
export * from './api';
export * from './lib';

// src/entities/index.ts
export * from './exercise';
// ... other entities
```

## 🎨 Code Style

### Arrow Functions Only with FC Type

All components MUST use arrow functions with `FC` type annotation and default export at the end:

```typescript
// ✅ CORRECT
import { FC } from 'react';

const ComponentName: FC = () => {
  return <div>Content</div>;
};

export default ComponentName;

// ❌ WRONG - don't use function declarations
export default function ComponentName() {
  return <div>Content</div>;
}

// ❌ WRONG - missing FC type annotation
const ComponentName = () => {
  return <div>Content</div>;
};
```

### Absolute Paths for Intra-Layer Imports

Within the same layer, use absolute paths starting with `src/`:

```typescript
// ✅ CORRECT - TypeScript imports use absolute paths
import Component from 'src/features/feature-name/ui/component';

// ❌ WRONG - no relative imports for TypeScript
import Component from './component';
```

Cross-layer imports continue to use aliases:
```typescript
import { Button } from '@shared';
import { Exercise } from '@entities';
```

### SCSS Imports (Exception)

SCSS module imports are the **only exception** to the absolute path rule:

```typescript
// ✅ CORRECT - TypeScript imports use absolute paths
import Component from 'src/features/feature-name/ui/component';

// ✅ CORRECT - SCSS imports use relative paths, import as 'classes'
import classes from './component.module.scss';

// ❌ WRONG - SCSS cannot use absolute paths
import classes from 'src/features/feature-name/ui/component.module.scss';
```

**SCSS File Location:**
- Always place `.module.scss` file in the **same directory** as the component
- Naming convention: `component-name.module.scss`

**Reasoning:**
- Vite/Rollup build tools require relative paths for CSS/SCSS modules
- This is a technical limitation, not a style preference

### Props Type Definition

**Use `type` for props, NOT `interface`, and always use `FC<Props>`:**

```typescript
// ✅ CORRECT
import { FC } from 'react';

type Props = {
  name: string;
  onClick: () => void;
};

const Component: FC<Props> = ({ name, onClick }) => {
  return <div onClick={onClick}>{name}</div>;
};

export default Component;

// ❌ WRONG - using interface for props
interface ComponentProps {
  name: string;
}
```

**For components with children, use `PropsWithChildren` and `FC`:**

```typescript
import { FC, PropsWithChildren } from 'react';

// Just children
const Wrapper: FC<PropsWithChildren> = ({ children }) => {
  return <div>{children}</div>;
};

// Children + other props
type Props = PropsWithChildren<{
  title: string;
}>;

const Modal: FC<Props> = ({ children, title }) => {
  return <div>{title}{children}</div>;
};
```

**Interfaces are ONLY for business entities:**

```typescript
interface Exercise {
  id: string;
  name: string;
  createdAt: Date;
}
```

## 🧩 Component Architecture

Components follow a **3-layer pattern** for separation of concerns:

### Component Typing Requirements

**ALL components MUST:**
1. Use `FC<Props>` type annotation from React
2. Have explicit return types for all functions and callbacks (including `void`)
3. Have explicit types for all inline callbacks in JSX

### 1. Data Layer (`*-data-layer.tsx`)
Connects to stores, fetches data, manages subscriptions.

```typescript
// add-exercise-form-data-layer.tsx
import { FC } from 'react';
import { useExerciseStore } from '@entities';
import AddExerciseFormLogicLayer from 'src/features/add-exercise/ui/add-exercise-form-logic-layer';

const AddExerciseFormDataLayer: FC = () => {
  const addExercise = useExerciseStore.use.addExercise();
  
  return <AddExerciseFormLogicLayer onAdd={addExercise} />;
};

export default AddExerciseFormDataLayer;
```

### 2. Logic Layer (`*-logic-layer.tsx`)
Handles hooks, state, event handlers, business logic.

```typescript
// add-exercise-form-logic-layer.tsx
import { FC, FormEvent, useState } from 'react';
import AddExerciseForm from 'src/features/add-exercise/ui/add-exercise-form';

type Props = {
  onAdd: (name: string) => void;
};

const AddExerciseFormLogicLayer: FC<Props> = ({ onAdd }) => {
  const [name, setName] = useState<string>('');
  
  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    onAdd(name);
    setName('');
  };
  
  return <AddExerciseForm name={name} onSubmit={handleSubmit} />;
};

export default AddExerciseFormLogicLayer;
```

### 3. Presentation Layer (`*.tsx`)
Pure presentational component, receives props, renders UI.

```typescript
// add-exercise-form.tsx
import { ChangeEvent, FC, FormEvent } from 'react';
import { Button } from '@shared';
import classes from './add-exercise-form.module.scss';

type Props = {
  name: string;
  onSubmit: (e: FormEvent) => void;
};

const AddExerciseForm: FC<Props> = ({ name, onSubmit }) => {
  return (
    <form className={classes.form} onSubmit={onSubmit}>
      <input 
        value={name}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => console.log(e.target.value)}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
};

export default AddExerciseForm;
```

**Notes:**
- Components use **arrow functions** with **`FC<Props>` type** and **default exports at the end**
- **ALL functions must have explicit return types** (including `void`)
- **Inline callbacks in JSX must have explicit parameter and return types**
- Use **absolute paths** for intra-layer imports (e.g., `src/features/...`)
- Use **path aliases** for cross-layer imports (e.g., `@shared`, `@entities`)
- Props use **`type`**, not `interface` (interfaces only for business entities)
- Local props named simply `Props`
- The data layer is re-exported as the main component name
- Not all layers are required (e.g., data layer can be skipped if no store access needed)

## 🗄️ State Management (Zustand)

All stores follow a consistent pattern with middleware:

### Store Creation

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createSelectors } from '@shared';

interface State {
  items: Item[];
  addItem: (item: Item) => void;
}

const useStoreBase = create<State>()(
  devtools(
    immer((set) => ({
      items: [],
      addItem: (item) => set((state) => {
        state.items.push(item); // mutate with immer
      }),
    })),
    { name: 'StoreName' }
  )
);

export const useStore = createSelectors(useStoreBase);
```

### Auto-Selectors Usage

The `createSelectors` utility generates type-safe selectors:

```typescript
// ❌ Without auto-selectors
const items = useStore((state) => state.items);
const addItem = useStore((state) => state.addItem);

// ✅ With auto-selectors
const items = useStore.use.items();
const addItem = useStore.use.addItem();
```

### Middleware Benefits

- **immer**: Simplifies immutable updates with mutable-style code
- **devtools**: Redux DevTools integration for debugging
- **createSelectors**: Auto-generated type-safe selectors

## 📦 Project Structure Example

```
src/
├── app/
│   ├── index.tsx              # App root exports
│   ├── providers/
│   │   └── index.tsx          # App providers
│   └── styles/
│       ├── global.scss        # Global styles
│       └── variables.scss     # SCSS variables
│
├── pages/
│   ├── index.ts               # Layer root
│   └── home/
│       ├── index.ts           # Slice exports
│       └── ui/
│           └── home-page.tsx  # Page component
│
├── widgets/
│   └── index.ts               # Layer root
│
├── features/
│   ├── index.ts               # Layer root
│   └── add-exercise/
│       ├── index.ts           # Slice exports
│       └── ui/
│           ├── index.ts       # Segment exports
│           ├── add-exercise-form-data-layer.tsx
│           ├── add-exercise-form-logic-layer.tsx
│           └── add-exercise-form.tsx
│
├── entities/
│   ├── index.ts               # Layer root
│   └── exercise/
│       ├── index.ts           # Slice exports
│       ├── model/
│       │   ├── index.ts       # Segment exports
│       │   ├── types.ts       # TypeScript types
│       │   └── store.ts       # Zustand store
│       └── api/
│           └── index.ts       # API functions
│
└── shared/
    ├── index.ts               # Layer root
    ├── ui/
    │   ├── index.ts           # Segment exports
    │   └── button/
    │       ├── index.ts
    │       ├── button.tsx
    │       └── button.module.scss
    ├── api/
    │   └── index.ts
    └── lib/
        ├── index.ts
        └── create-selectors.ts
```

## 🎨 Styling

- **SCSS Modules** for component-scoped styles
- Global variables in `src/app/styles/variables.scss`
- Global styles in `src/app/styles/global.scss`

## 🚦 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## 📐 TypeScript Configuration

TypeScript is configured with **strict mode** enabled:

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`

**No `any` types allowed** - all code must be properly typed.

## 🔧 Path Aliases

Configured in `tsconfig.json` and `vite.config.ts`:

- `@app` → `src/app`
- `@pages` → `src/pages`
- `@widgets` → `src/widgets`
- `@features` → `src/features`
- `@entities` → `src/entities`
- `@shared` → `src/shared`

## 📊 Charting

**Recharts** is used for workout progress visualization:
- Time-series charts for tracking progress
- Fully typed with TypeScript
- Responsive and customizable

## 🔄 Future Enhancements

- React Router for multi-page navigation
- Workout session tracking
- Progress charts and analytics
- Data persistence (localStorage/API)
- Authentication
- Dark mode

## 📝 License

MIT - See LICENSE file for details

## 👤 Author

Alexander Evstafiadi

---

Built with ❤️ using Feature-Sliced Design
