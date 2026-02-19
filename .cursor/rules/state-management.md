# State Management Rules (Zustand)

## Store Creation Pattern

All Zustand stores MUST follow this pattern:

### 1. Store Structure

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createSelectors } from '@shared';

interface StoreState {
  // State properties
  data: Data[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setData: (data: Data[]) => void;
  addItem: (item: Data) => void;
  removeItem: (id: string) => void;
}

const useStoreBase = create<StoreState>()(
  devtools(
    immer((set) => ({
      // Initial state
      data: [],
      isLoading: false,
      error: null,
      
      // Actions with immer
      setData: (data) => set((state) => {
        state.data = data;
      }),
      
      addItem: (item) => set((state) => {
        state.items.push(item); // mutate directly with immer
      }),
      
      removeItem: (id) => set((state) => {
        state.items = state.items.filter(item => item.id !== id);
      }),
    })),
    { name: 'StoreName' } // For Redux DevTools
  )
);

// Apply auto-selectors
export const useStore = createSelectors(useStoreBase);
```

### 2. Middleware Order

Always apply middleware in this order:
```typescript
devtools(
  immer((set) => ({
    // store implementation
  })),
  { name: 'StoreName' }
)
```

### 3. Auto-Selectors Usage

**❌ WRONG - Manual selectors:**
```typescript
const data = useStore((state) => state.data);
const isLoading = useStore((state) => state.isLoading);
const addItem = useStore((state) => state.addItem);
```

**✅ CORRECT - Auto-selectors:**
```typescript
const data = useStore.use.data();
const isLoading = useStore.use.isLoading();
const addItem = useStore.use.addItem();
```

## Immer Best Practices

With immer middleware, you can mutate state directly in actions:

### ✅ CORRECT - Mutate with immer

```typescript
addItem: (item) => set((state) => {
  state.items.push(item);
}),

updateItem: (id, updates) => set((state) => {
  const item = state.items.find(i => i.id === id);
  if (item) {
    Object.assign(item, updates);
  }
}),

removeItem: (id) => set((state) => {
  state.items = state.items.filter(i => i.id !== id);
}),
```

### ❌ WRONG - Immutable patterns not needed

```typescript
// Don't do this with immer
addItem: (item) => set((state) => ({
  items: [...state.items, item]
})),
```

## Store Location

Stores belong in the `model` segment of entities or features:

```
entities/
└── exercise/
    └── model/
        ├── types.ts     # TypeScript types
        └── store.ts     # Zustand store
```

## Store Exports

Export stores through the slice index:

```typescript
// entities/exercise/model/index.ts
export { useExerciseStore } from './store';
export type { Exercise, CreateExerciseDto } from './types';

// entities/exercise/index.ts
export { useExerciseStore } from './model';
export type { Exercise, CreateExerciseDto } from './model';

// entities/index.ts
export * from './exercise';
```

## Store Usage in Components

### Data Layer Component

```typescript
import { useExerciseStore } from '@entities';

export default function ComponentDataLayer() {
  // Use auto-selectors
  const exercises = useExerciseStore.use.exercises();
  const addExercise = useExerciseStore.use.addExercise();
  const isLoading = useExerciseStore.use.isLoading();
  
  return (
    <ComponentLogicLayer
      exercises={exercises}
      onAdd={addExercise}
      isLoading={isLoading}
    />
  );
}
```

### Never Access Store Outside Data Layer

Logic and presentation layers should never import or use stores directly.

## DevTools Configuration

Always provide a meaningful name for Redux DevTools:

```typescript
devtools(
  immer((set) => ({ /* ... */ })),
  { name: 'ExerciseStore' } // Clear, descriptive name
)
```

## Type Safety

- All store state must be typed
- No `any` types in stores
- Action parameters must be typed
- Use TypeScript interfaces for state shape

```typescript
interface Exercise {
  id: string;
  name: string;
  createdAt: Date;
}

interface ExerciseState {
  exercises: Exercise[];
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
}
```

## Async Actions

For async operations, use separate actions:

```typescript
interface StoreState {
  data: Data[];
  isLoading: boolean;
  error: string | null;
  
  fetchData: () => Promise<void>;
  setData: (data: Data[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const useStoreBase = create<StoreState>()(
  devtools(
    immer((set, get) => ({
      data: [],
      isLoading: false,
      error: null,
      
      fetchData: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const data = await api.fetchData();
          set((state) => {
            state.data = data;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = error.message;
            state.isLoading = false;
          });
        }
      },
      
      setData: (data) => set((state) => {
        state.data = data;
      }),
      
      setLoading: (loading) => set((state) => {
        state.isLoading = loading;
      }),
      
      setError: (error) => set((state) => {
        state.error = error;
      }),
    })),
    { name: 'StoreName' }
  )
);

export const useStore = createSelectors(useStoreBase);
```

## Single Source of Truth

- One store per entity/feature
- Don't duplicate state across stores
- Derive computed values instead of storing them
- Keep stores focused and cohesive
