# Specification: Shared Components

## Overview

Specification for shared UI components. Extensible — new components are added as sections in this file. Describes the dot-dot-dot menu button and the numeric field.

---

## Dot-dot-dot Menu Button

### Purpose

Reusable context menu trigger button. Used on Home page for Edit/Delete workout list actions.

### Location

`shared/ui/menu-button/`

### Files

- `menu-button.tsx` — Headless UI `Menu` + trigger + items; default export.
- `menu-button.types.ts` — `MenuItem` type for `items` prop.
- `menu-button.module.scss` — trigger, panel, item styles.

### Props

`MenuItem` is defined in `menu-button.types.ts`. Component props:

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

- Icon: ⋮ (three vertical dots), decorative (`aria-hidden` on the glyph span).
- Dropdown panel: positioned below the trigger, start-aligned (`anchor="bottom start"` — LTR: left edge with trigger).
- Menu items: rendered in order (e.g., Edit first, Delete second).

### Behaviour

- Choosing an item runs `item.onClick()` and closes the menu (Headless UI `close()`).
- Empty `items` still renders a trigger; callers supply items.

### Accessibility

- `aria-label` on the trigger (default: `"Open menu"`).
- Keyboard navigation and focus management via Headless UI `Menu`.

### Storybook

- Title: `Shared/MenuButton`
- File: `menu-button.stories.tsx` (default items, custom `ariaLabel`, single item).

### Tests

- Unit: `specs/menu-button.spec.unit.tsx`
- Snapshot: `specs/menu-button.spec.snap.tsx`

### Usage

Referenced by: [edit-workout-list.spec.md](edit-workout-list.spec.md), [home-page.spec.md](home-page.spec.md)

---

## Numeric field

### Purpose

Controlled numeric input with empty state (`null`), full selection on focus for fast overwrite, and optional inline validation message. Used in workout list exercise rows for weight (decimal), reps, and sets (integers).

### Location

`shared/ui/numeric-field/`

### Files

- `numeric-field-logic-layer.tsx` — state, draft sync, parsing, focus/select; default export is the public `NumericField`.
- `numeric-field.tsx` — presentation only (`NumericFieldView`): Headless `Field` / `Label` / `Input` / `Description`.

### Props (public component)

The public component uses an internal `Props` type (not exported). Documented shape:

- `label: string`
- `value: number | null`
- `onChange: (value: number | null) => void`
- `variant: 'integer' | 'decimal'`
- `error?: string`
- `id?: string`
- `disabled?: boolean`
- `size?: 'md' | 'sm'` — `md` uses `inputMd` (larger vertical padding); `sm` uses `inputSm` (tighter). Input text is **center-aligned for both**.

### Tech Stack

| Category | Technology |
|----------|------------|
| UI | Headless UI `Field`, `Label`, `Input`, `Description` |
| Styling | SCSS Modules |

### UI

- Layout: label above, single-line text `Input`, optional error line below (`Description`).
- Sizes: `md` / `sm` map to SCSS classes; numeric text centered in the input for both.

### Behaviour

- Renders as `type="text"` with `inputMode="decimal"` or `numeric` so the field can be cleared.
- On focus, the input value is fully selected (`select()`).
- `variant="integer"` — digits only; `variant="decimal"` — single decimal point, preserves in-progress typing (e.g. trailing `.`) while staying in sync with `value`.
- When `error` is set, `Input` receives `invalid` and `Description` shows the message below the field.

### Accessibility

- `Label` is associated with the input via `htmlFor` / `id` when `id` is passed.
- Validation: `invalid` on `Input` plus error text in `Description`.
- `disabled` flows through `Field` and `Input`.
- `inputMode` steers mobile keyboards toward numeric entry.

### Storybook

- Title: `Shared/NumericField`
- File: `numeric-field.stories.tsx` (controlled wrappers for interactive stories).

### Tests

- Unit: `specs/numeric-field.spec.unit.tsx`
- Snapshot: `specs/numeric-field.spec.snap.tsx`

### Usage

Referenced by: workout list form (`widgets/workout-list-form`) for exercise weight, reps, and sets. Domain validation messages for that form live in `widgets/workout-list-form/model/exercise-numeric-validation.ts`.
