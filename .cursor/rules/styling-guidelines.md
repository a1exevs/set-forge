# Styling Guidelines

## SCSS Modules

This project uses **SCSS Modules** for component-scoped styling.

## File Structure

Each component MUST have its SCSS file in the **same directory**:

```
component/
├── component-name.tsx
├── component-name.module.scss  ✓ Same directory
└── component-name-logic-layer.tsx
```

❌ **WRONG** - SCSS in separate folder:
```
component/
├── ui/
│   └── component-name.tsx
└── styles/
    └── component-name.module.scss  ✗ Wrong location
```

## Import and Usage

**ALWAYS use relative paths for SCSS:**

```typescript
// ✅ CORRECT - relative path for SCSS
import styles from './component-name.module.scss';

// ❌ WRONG - absolute path not supported for SCSS
import styles from 'src/layer/component-name.module.scss';
```

**This is the ONLY exception to the absolute paths rule.**

**Complete example:**

```typescript
// TypeScript imports - absolute paths
import Component from 'src/features/feature-name/ui/component';
import { Button } from '@shared';

// SCSS imports - relative path (exception)
import styles from './component-name.module.scss';

const ComponentName = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Title</h1>
      <Button className={styles.button}>Click</Button>
    </div>
  );
};

export default ComponentName;
```

## Class Naming Convention

Use **camelCase** for class names in SCSS modules:

```scss
// ✅ CORRECT
.container {
  padding: 1rem;
}

.primaryButton {
  background: blue;
}

.cardHeader {
  font-weight: bold;
}

// ❌ WRONG - don't use kebab-case in modules
.primary-button {
  background: blue;
}
```

## Global Variables

Use variables defined in `src/app/styles/variables.scss`:

```scss
@import './variables.scss'; // Auto-imported in vite.config.ts

.button {
  background-color: $primary-color;
  padding: $spacing-md;
  border-radius: $radius-md;
  font-size: $font-size-base;
  box-shadow: $shadow-sm;
}
```

## Available Variables

### Colors
```scss
$primary-color: #3b82f6;
$secondary-color: #6b7280;
$danger-color: #ef4444;
$success-color: #10b981;
$warning-color: #f59e0b;

$text-primary: #1f2937;
$text-secondary: #6b7280;
$text-light: #9ca3af;

$bg-primary: #ffffff;
$bg-secondary: #f9fafb;
$bg-tertiary: #f3f4f6;

$border-color: #e5e7eb;
```

### Spacing
```scss
$spacing-xs: 0.25rem;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 1.5rem;
$spacing-xl: 2rem;
$spacing-2xl: 3rem;
```

### Border Radius
```scss
$radius-sm: 0.25rem;
$radius-md: 0.375rem;
$radius-lg: 0.5rem;
$radius-xl: 0.75rem;
```

### Shadows
```scss
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

### Typography
```scss
$font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', ...;

$font-size-xs: 0.75rem;
$font-size-sm: 0.875rem;
$font-size-base: 1rem;
$font-size-lg: 1.125rem;
$font-size-xl: 1.25rem;
$font-size-2xl: 1.5rem;
$font-size-3xl: 1.875rem;
```

## Nesting

Use nesting for modifiers and pseudo-classes:

```scss
.button {
  padding: $spacing-md;
  background: $primary-color;
  color: white;
  
  &:hover {
    background: darken($primary-color, 10%);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.small {
    padding: $spacing-sm;
    font-size: $font-size-sm;
  }
  
  &.large {
    padding: $spacing-lg;
    font-size: $font-size-lg;
  }
}
```

## Combining Classes

Use template literals for multiple classes:

```typescript
// Single class
<div className={classes.container}>

// Multiple classes
<div className={`${classes.button} ${classes.primary}`}>

// Conditional classes
<div className={`${classes.button} ${isActive ? classes.active : ''}`}>

// Complex conditional
const classNames = [
  classes.button,
  variant === 'primary' && classes.primary,
  variant === 'secondary' && classes.secondary,
  disabled && classes.disabled,
].filter(Boolean).join(' ');

<button className={classNames}>
```

## Responsive Design

Use media queries in SCSS:

```scss
.container {
  padding: $spacing-md;
  
  @media (min-width: 768px) {
    padding: $spacing-lg;
  }
  
  @media (min-width: 1024px) {
    padding: $spacing-xl;
  }
}
```

## Flexbox Layouts

Prefer flexbox for layouts:

```scss
.container {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
}
```

## Grid Layouts

Use CSS Grid for complex layouts:

```scss
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $spacing-lg;
}
```

## Transitions

Add smooth transitions:

```scss
.button {
  transition: all 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}
```

## Z-Index Management

Define z-index layers consistently:

```scss
// Define in variables or constants
$z-modal: 1000;
$z-dropdown: 100;
$z-header: 10;

.modal {
  z-index: $z-modal;
}
```

## Avoid Inline Styles

Never use inline styles. Always use SCSS modules:

```typescript
// ❌ WRONG
<div style={{ padding: '1rem', color: 'blue' }}>

// ✅ CORRECT
<div className={classes.container}>
```

## BEM-like Naming in Modules

Follow BEM-like naming within modules:

```scss
.card {
  border: 1px solid $border-color;
  
  // Element
  &Header {
    padding: $spacing-md;
    border-bottom: 1px solid $border-color;
  }
  
  &Body {
    padding: $spacing-lg;
  }
  
  &Footer {
    padding: $spacing-md;
    border-top: 1px solid $border-color;
  }
  
  // Modifier
  &Highlighted {
    border-color: $primary-color;
    box-shadow: $shadow-md;
  }
}
```

Usage:
```typescript
<div className={classes.card}>
  <div className={classes.cardHeader}>Header</div>
  <div className={classes.cardBody}>Body</div>
  <div className={classes.cardFooter}>Footer</div>
</div>
```

## Don't Use Global Styles

Global styles belong only in `src/app/styles/global.scss`. Never add global styles in component modules.

## Shared UI Components

Shared UI components (buttons, inputs, etc.) should:
- Live in `src/shared/ui/`
- Have their own SCSS module
- Be wrapped versions of Headless UI or custom implementations
- Be highly reusable

```
shared/
└── ui/
    └── button/
        ├── index.ts
        ├── button.tsx
        └── button.module.scss
```
