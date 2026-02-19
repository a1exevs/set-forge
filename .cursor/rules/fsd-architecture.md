# Feature-Sliced Design Architecture Rules

## Project Structure

This project follows **Feature-Sliced Design (FSD)** methodology.

### Layer Hierarchy

```
app → pages → widgets → features → entities → shared
```

Each layer can only import from layers below it. Never import upwards.

### Layers Description

- **app/** - Application initialization, providers, global styles
- **pages/** - Page components (routing level)
- **widgets/** - Complex composite UI blocks
- **features/** - User interactions and business features
- **entities/** - Business entities and domain models
- **shared/** - Reusable utilities, UI components, API clients

### Segments

Within each layer (except `shared`), organize by slices (feature/entity names), then segments:

- **ui/** - UI components
- **model/** - Business logic, types, stores
- **api/** - API interactions

## Import Rules

### ✅ CORRECT: Cross-layer imports via single-word aliases

```typescript
import { Button, createSelectors } from '@shared';
import { Exercise, useExerciseStore } from '@entities';
import { AddExerciseForm } from '@features';
import { WorkoutChart } from '@widgets';
import { HomePage } from '@pages';
```

### ❌ FORBIDDEN: Nested path imports

```typescript
// NEVER do this
import { Button } from '@shared/ui';
import { Exercise } from '@entities/exercise';
import { useExerciseStore } from '@entities/exercise/model';
```

### ✅ CORRECT: Intra-layer imports with full paths

```typescript
// Within the same layer, use absolute paths
import { AddExerciseFormLogicLayer } from 'src/features/add-exercise/ui/add-exercise-form-logic-layer';
```

## Public API Exports

### Layer Root Index

Every layer MUST have a root `index.ts` that re-exports all public APIs:

```typescript
// src/entities/index.ts
export * from './exercise';
export * from './workout';

// src/features/index.ts
export * from './add-exercise';
export * from './edit-exercise';

// src/shared/index.ts
export * from './ui';
export * from './api';
export * from './lib';
```

### Slice Index

Every slice MUST have an `index.ts`:

```typescript
// src/entities/exercise/index.ts
export { useExerciseStore } from './model';
export { exerciseApi } from './api';
export type { Exercise, MuscleGroup, CreateExerciseDto } from './model';
```

### Segment Index

Every segment MUST have an `index.ts`:

```typescript
// src/entities/exercise/model/index.ts
export { useExerciseStore } from './store';
export type { Exercise, MuscleGroup, CreateExerciseDto } from './types';
```

## When Creating New Code

1. Identify the correct layer for your feature
2. Create or use existing slice within that layer
3. Organize code by segments (ui, model, api)
4. Create `index.ts` files at each level
5. Export only public API through index files
6. Use single-word imports from other layers

## Example Structure

```
src/
├── entities/
│   ├── index.ts                    # Layer root
│   └── exercise/
│       ├── index.ts                # Slice exports
│       ├── model/
│       │   ├── index.ts            # Segment exports
│       │   ├── types.ts
│       │   └── store.ts
│       └── api/
│           └── index.ts
│
├── features/
│   ├── index.ts                    # Layer root
│   └── add-exercise/
│       ├── index.ts                # Slice exports
│       └── ui/
│           ├── index.ts            # Segment exports
│           ├── add-exercise-form-data-layer.tsx
│           ├── add-exercise-form-logic-layer.tsx
│           └── add-exercise-form.tsx
│
└── shared/
    ├── index.ts                    # Layer root
    ├── ui/
    │   ├── index.ts                # Segment exports
    │   └── button/
    │       ├── index.ts
    │       ├── button.tsx
    │       └── button.module.scss
    └── lib/
        ├── index.ts
        └── create-selectors.ts
```
