# Component Typing Rules

## React.FC Requirement

**ALL React components MUST use `FC<Props>` type annotation.**

### ❌ WRONG - Component without FC

```typescript
const ComponentName = ({ name }: Props) => {
  return <div>{name}</div>;
};
```

### ✅ CORRECT - Component with FC

```typescript
import { FC } from 'react';

type Props = {
  name: string;
};

const ComponentName: FC<Props> = ({ name }) => {
  return <div>{name}</div>;
};

export default ComponentName;
```

## Component Patterns

### Components Without Props

```typescript
import { FC } from 'react';

const ComponentName: FC = () => {
  return <div>Content</div>;
};

export default ComponentName;
```

### Components With Props

```typescript
import { FC } from 'react';

type Props = {
  name: string;
  onClick: () => void;
};

const ComponentName: FC<Props> = ({ name, onClick }) => {
  return <div onClick={onClick}>{name}</div>;
};

export default ComponentName;
```

### Components With Children Only

```typescript
import { FC, PropsWithChildren } from 'react';

const Wrapper: FC<PropsWithChildren> = ({ children }) => {
  return <div>{children}</div>;
};

export default Wrapper;
```

### Components With Children + Props

```typescript
import { FC, PropsWithChildren } from 'react';

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

export default Modal;
```

## Explicit Return Types for Functions

**ALL functions and callbacks MUST have explicit return types, including `void`.**

### Event Handlers

```typescript
// ❌ WRONG - no explicit return type
const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
};

// ✅ CORRECT - explicit void return type
const handleSubmit = (e: FormEvent): void => {
  e.preventDefault();
};
```

### Functions That Return Values

```typescript
// ❌ WRONG - implicit return type
const calculateTotal = (items: Item[]) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ✅ CORRECT - explicit return type
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};
```

### Functions Inside Components

```typescript
import { FC, useState } from 'react';

const Component: FC = () => {
  const [count, setCount] = useState<number>(0);
  
  // ✅ CORRECT - explicit return types
  const increment = (): void => {
    setCount(count + 1);
  };
  
  const getDoubledCount = (): number => {
    return count * 2;
  };
  
  const resetIfEven = (): void => {
    if (count % 2 === 0) {
      setCount(0);
    }
  };
  
  return <div onClick={increment}>{count}</div>;
};
```

## Inline Callbacks Typing

**ALL inline callbacks in JSX MUST have explicit parameter types and return types.**

### onChange Handlers

```typescript
// ❌ WRONG - no explicit types
<input onChange={(e) => setValue(e.target.value)} />

// ✅ CORRECT - explicit types for parameter and return
<input onChange={(e: ChangeEvent<HTMLInputElement>): void => setValue(e.target.value)} />
```

### onClick Handlers

```typescript
// ❌ WRONG - no explicit types
<button onClick={() => doSomething()}>Click</button>

// ✅ CORRECT - explicit void return type
<button onClick={(): void => doSomething()}>Click</button>

// ✅ CORRECT - with parameter
<button onClick={(e: MouseEvent<HTMLButtonElement>): void => handleClick(e)}>
  Click
</button>
```

### Array map Callbacks

```typescript
// ❌ WRONG - no explicit types
{items.map((item) => (
  <div key={item.id}>{item.name}</div>
))}

// ✅ CORRECT - explicit types
{items.map((item: Item) => (
  <div key={item.id}>{item.name}</div>
))}
```

### Complex Inline Handlers

```typescript
// ✅ CORRECT - all parameters and return types explicit
<select
  value={value}
  onChange={(e: ChangeEvent<HTMLSelectElement>): void => {
    const newValue = e.target.value;
    setValue(newValue);
    onValueChange(newValue);
  }}
>
  <option value="a">A</option>
</select>
```

## Complete Example

```typescript
import { ChangeEvent, FC, FormEvent, useState } from 'react';
import { Button } from '@shared';
import type { Item } from '@entities';

type Props = {
  items: Item[];
  onSubmit: (name: string) => void;
};

const ExampleForm: FC<Props> = ({ items, onSubmit }) => {
  const [name, setName] = useState<string>('');
  
  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    onSubmit(name);
    setName('');
  };
  
  const isValid = (): boolean => {
    return name.trim().length > 0;
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => setName(e.target.value)}
        placeholder="Enter name"
      />
      
      <div>
        {items.map((item: Item) => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
      
      <Button
        type="submit"
        disabled={!isValid()}
        onClick={(): void => console.log('Submitting')}
      >
        Submit
      </Button>
    </form>
  );
};

export default ExampleForm;
```

## Summary

1. **ALL components** must use `FC<Props>` or `FC<PropsWithChildren>` or just `FC`
2. **ALL functions** must have explicit return types (including `void`)
3. **ALL inline callbacks** in JSX must have explicit parameter and return types
4. **Use `type` for Props**, NOT `interface` (interfaces only for business entities)
5. **Import FC** from react in every component file
