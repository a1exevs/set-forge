# Specification: Shared Components

## Overview

Specification for shared UI components. Extensible — new components are added as sections in this file. Currently describes only the dot-dot-dot menu button.

---

## Dot-dot-dot Menu Button

### Purpose

Reusable context menu trigger button. Used on Home page for Edit/Delete workout list actions.

### Location

`shared/ui/menu-button/`

### Props

```typescript
type MenuItem = {
  id: string;
  label: string;
  onClick: () => void;
};

type Props = {
  items: MenuItem[];
  ariaLabel?: string;
};
```

### Tech Stack

| Category | Technology |
|----------|------------|
| UI | Headless UI `Menu` (already in project) |
| Styling | SCSS Modules |

### UI

- Icon: ⋮ (three vertical dots)
- Dropdown: opens down-right from button
- Menu items: rendered in order (e.g., Edit first, Delete second)

### Accessibility

- `aria-label` for the trigger button (default: "Open menu")
- Keyboard navigation via Headless UI Menu

### Usage

Referenced by: [edit-workout-list.spec.md](edit-workout-list.spec.md), [home-page.spec.md](home-page.spec.md)
