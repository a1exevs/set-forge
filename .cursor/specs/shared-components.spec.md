# Specification: Shared Components

## Overview

Specification for shared UI components in `client/src/shared/ui/`. New components are added as sections in this file.

**Components (7):**

| Component | Public export (`@shared`) | Storybook title |
|-----------|---------------------------|-----------------|
| Button | `Button` | `Shared/Button` |
| IconButton | `IconButton` | `Shared/IconButton` |
| MenuButton | `MenuButton`, `MenuItem` type | `Shared/MenuButton` |
| UserAvatarMenu | `UserAvatarMenu` | `Shared/UserAvatarMenu` |
| NumericField | `NumericField` | `Shared/NumericField` |
| Dialog | internal only (used by ConfirmDialog) | `Shared/Dialog` |
| ConfirmDialog | `ConfirmDialogProvider`, `useConfirm` | `Shared/ConfirmDialog` |

All components use Headless UI where applicable and SCSS Modules for styling. The `styles/` directory (themes, variables, global) is not a component and is out of scope here.

---

## Button

### Purpose

Primary action button with text label. Used in forms and dialogs (submit, cancel, add exercise, etc.).

### Location

`shared/ui/button/`

### Files

- `button.tsx` — Headless UI `Button` wrapper; default export.
- `button.module.scss` — variant and size styles.

### Props

```typescript
type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
  }
>;
```

- `variant` defaults to `primary`; `size` defaults to `md`.
- Standard button HTML attributes (`disabled`, `type`, `onClick`, `className`, `aria-label`, etc.) are forwarded.

### Tech stack

| Category | Technology |
|----------|------------|
| UI | Headless UI `Button` |
| Styling | SCSS Modules |

### UI

- Inline-flex layout with centered label; min-height 44px (`md`), 36px (`sm`), 52px (`lg`).
- **primary** — `$primary-color` background, `$bg-primary` text; hover opacity + shadow.
- **secondary** — `$bg-tertiary` background, border; hover background/border change.
- **danger** — `$danger-color` background, white text.
- Press feedback: slight scale-down via Headless `[data-active]`.

### Behavior

- Renders as `<button>` unless overridden by Headless internals.
- Disabled state uses Headless `[data-disabled]` (opacity 0.5, not-allowed cursor).

### Accessibility

- Callers should provide visible text or `aria-label` for icon-only usage.
- Focus and keyboard activation handled by Headless UI `Button`.

### Storybook

- Title: `Shared/Button`
- File: `button.stories.tsx`
- Stories: Default, Primary, Secondary, Danger, Small, Large, Disabled.

### Tests

- Unit: `specs/button.spec.unit.tsx`
- Snapshot: `specs/button.spec.snap.tsx`

### Usage

- `widgets/workout-list-form` — Add Exercise, Cancel, Create/Update List.
- `shared/ui/confirm-dialog` — Confirm and Cancel actions.

---

## IconButton

### Purpose

Square or circular icon-only button. Used on the Home page for import/export (ghost) and the fixed create-workout FAB (primary).

### Location

`shared/ui/icon-button/`

### Files

- `icon-button.tsx` — Headless UI `Button` wrapper with optional polymorphic `as`; default export.
- `icon-button.module.scss` — ghost/primary variants and sizes.

### Props

```typescript
type CommonProps = PropsWithChildren<{
  variant?: 'ghost' | 'primary';
  size?: 'md' | 'lg';
}>;

type AsButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button';
    to?: never;
  };

type AsLinkProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
    as: ElementType;
    to: string;
  };

type Props = AsButtonProps | AsLinkProps;
```

- `variant` defaults to `ghost`; `size` defaults to `md`.
- `as` — render as another element (e.g. TanStack Router `Link` with `to="/create"`); `to` is **required** when `as` is not `'button'`.
- `type` defaults to `button`; omitted when `as` is not `'button'`.
- Callers pass icon SVG as `children`; use `aria-label` and optional `title` for browser tooltip.

### Tech stack

| Category | Technology |
|----------|------------|
| UI | Headless UI `Button` |
| Styling | SCSS Modules |

### UI

- **ghost** — 44×44px min, rounded `$radius-md`, transparent background, `$text-primary` icon; hover `$bg-hover`.
- **primary** — circular (`border-radius: 50%`), 56×56px when `size="lg"`, `$primary-color` background, `$bg-primary` icon color, `$shadow-lg`.
- **md** — 44×44px; **lg** — 56×56px.
- SVG children block-level; press scale via `[data-active]`.

### Behavior

- Supports navigation when `as={Link}` and `to` are set (single interactive element, no nested `<button>` in `<a>`).
- Disabled: opacity 0.5, `[data-disabled]`, click suppressed.

### Accessibility

- **`aria-label` is required** for icon-only controls (screen readers).
- **`title`** — optional native browser tooltip (used for import/export/create hints on Home page).
- Focus, keyboard, and disabled semantics via Headless UI.

### Storybook

- Title: `Shared/IconButton`
- File: `icon-button.stories.tsx`
- Stories: Ghost, Primary (FAB example), Large, Disabled, WithTitle.

### Tests

- Unit: `specs/icon-button.spec.unit.tsx`
- Snapshot: `specs/icon-button.spec.snap.tsx`

### Usage

Referenced by: [home-page.spec.md](home-page.spec.md)

- Header: ghost `IconButton` for Export / Import (`title` + `aria-label`).
- Fixed bottom-right FAB: primary `lg` with `as={Link}` `to="/create"`.

---

## MenuButton

### Purpose

Reusable ⋮ context menu trigger. Used on the Home page for Edit/Delete workout list actions.

### Location

`shared/ui/menu-button/`

### Files

- `menu-button.tsx` — Headless UI `Menu` + trigger + items; default export.
- `menu-button.types.ts` — `MenuItem` type for `items` prop.
- `menu-button.module.scss` — trigger, panel, item styles.

### Props

`MenuItem` is defined in `menu-button.types.ts`:

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

### Tech stack

| Category | Technology |
|----------|------------|
| UI | Headless UI `Menu`, `MenuButton`, `MenuItems`, `MenuItem` |
| Styling | SCSS Modules |

### UI

- Icon: ⋮ (three vertical dots), decorative (`aria-hidden` on the glyph span).
- Dropdown panel: positioned below the trigger, start-aligned (`anchor="bottom start"`).
- Menu items rendered in caller-supplied order (e.g. Edit, then Delete).

### Behavior

- Choosing an item runs `item.onClick()` and closes the menu (Headless UI `close()`).
- Empty `items` still renders a trigger; callers supply items.

### Accessibility

- `aria-label` on the trigger (default: `"Open menu"`).
- Keyboard navigation and focus management via Headless UI `Menu`.

### Storybook

- Title: `Shared/MenuButton`
- File: `menu-button.stories.tsx`
- Stories: Default, CustomAriaLabel, SingleItem.

### Tests

- Unit: `specs/menu-button.spec.unit.tsx`
- Snapshot: `specs/menu-button.spec.snap.tsx`

### Usage

Referenced by: [edit-workout-list.spec.md](edit-workout-list.spec.md), [home-page.spec.md](home-page.spec.md)

---

## UserAvatarMenu

### Purpose

Circular avatar (letter from user email) as the trigger for a small account menu (e.g. Log out). **Planned for the Settings page** (account section with logout). Previously on the Home header; removed when the header switched to `logo.svg`. Pattern mirrors `MenuButton` (Headless UI `Menu`, `close()` after action).

### Location

`shared/ui/user-avatar-menu/`

### Files

- `user-avatar-menu.tsx` — Headless UI `Menu` + circular trigger; default export.
- `user-avatar-menu.module.scss` — trigger, letter, dropdown styles.

### Props

```typescript
type Props = {
  letter: string;
  items: MenuItem[]; // same shape as MenuButton — id, label, onClick
  ariaLabel?: string;
};
```

- `letter` — single visible character (caller computes from email local-part).

### Tech stack

| Category | Technology |
|----------|------------|
| UI | Headless UI `Menu`, `MenuButton`, `MenuItems`, `MenuItem` |
| Styling | SCSS Modules |

### UI

- Round trigger (2.5rem), bordered, `$bg-secondary` background, centered bold letter.
- Hover/focus: background and border highlight.
- Dropdown: `anchor="bottom start"`, same panel pattern as `MenuButton`.

### Behavior

- Same as `MenuButton`: item click → `onClick()` + menu close.
- Default `ariaLabel`: `"Account menu"`.

### Accessibility

- `aria-label` on trigger (caller should pass email-specific label when available, e.g. `"Account menu for user@example.com"`).
- Letter span is `aria-hidden`; menu keyboard support via Headless UI.

### Storybook

- Title: `Shared/UserAvatarMenu`
- File: `user-avatar-menu.stories.tsx`
- Stories: Default (letter `J`, Log out item).

### Tests

- Unit: `specs/user-avatar-menu.spec.unit.tsx`
- Snapshot: `specs/user-avatar-menu.spec.snap.tsx`

### Usage

Referenced by: [home-page.spec.md](home-page.spec.md), [auth-session.spec.md](auth-session.spec.md)

---

## NumericField

### Purpose

Controlled numeric input with empty state (`null`), full selection on focus for fast overwrite, and optional inline validation message. Used in workout list exercise rows for weight (decimal), reps, and sets (integers).

### Location

`shared/ui/numeric-field/`

### Files

- `numeric-field-logic-layer.tsx` — state, draft sync, parsing, focus/select; **default export is the public `NumericField`**.
- `numeric-field.tsx` — presentation only (`NumericFieldView`): Headless `Field` / `Label` / `Input` / `Description`.
- `numeric-field.module.scss` — field, label, input sizes, error styles.

### Props

Public component (internal type, not exported):

```typescript
type Props = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  variant: 'integer' | 'decimal';
  error?: string;
  id?: string;
  disabled?: boolean;
  size?: 'md' | 'sm';
};
```

- `size` defaults to `md`. Input text is **center-aligned** for both sizes.

### Tech stack

| Category | Technology |
|----------|------------|
| UI | Headless UI `Field`, `Label`, `Input`, `Description` |
| Styling | SCSS Modules |

### UI

- Layout: label above, single-line text `Input`, optional error line below (`Description`).
- **sm** / **md** map to SCSS classes (`inputSm`, `inputMd`).

### Behavior

- Renders as `type="text"` with `inputMode="decimal"` or `"numeric"` so the field can be cleared.
- On focus, input value is fully selected (`select()`).
- **`integer`** — digits only; parses with `parseInt`.
- **`decimal`** — single decimal point; preserves in-progress typing (e.g. trailing `.`) while syncing with `value`.
- When `error` is set, `Input` receives `invalid` and `Description` shows the message.

### Accessibility

- `Label` associated with input via `htmlFor` / `id` when `id` is passed.
- Validation: `invalid` on `Input` plus error text in `Description`.
- `disabled` flows through `Field` and `Input`.
- `inputMode` steers mobile keyboards toward numeric entry.

### Storybook

- Title: `Shared/NumericField`
- File: `numeric-field.stories.tsx`
- Stories: DecimalDefault, IntegerDefault, Empty, WithError, DecimalMedium, Disabled (controlled wrappers).

### Tests

- Unit: `specs/numeric-field.spec.unit.tsx`
- Snapshot: `specs/numeric-field.spec.snap.tsx`

### Usage

- `widgets/workout-list-form` — exercise weight, reps, sets.
- Domain validation messages for that form: `widgets/workout-list-form/model/exercise-numeric-validation.ts`.

---

## Dialog

### Purpose

Modal overlay shell: backdrop, centered panel, open/close lifecycle, optional animations. Building block for `ConfirmDialog`; not re-exported from `@shared`.

### Location

`shared/ui/dialog/`

### Files

- `dialog.tsx` — Headless UI `Dialog`, `DialogBackdrop`, `DialogPanel`; default export.
- `dialog.module.scss` — root, backdrop, overlay, panel, transitions.

### Props

```typescript
type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  backdropColor?: string;
  disableAnimation?: boolean;
  initialFocus?: RefObject<HTMLElement | null> | MutableRefObject<HTMLElement | null>;
  ariaLabel?: string;
  ariaDescribedBy?: string;
};
```

- `backdropColor` defaults to `#000000`.
- `disableAnimation` defaults to `false`.

### Tech stack

| Category | Technology |
|----------|------------|
| UI | Headless UI `Dialog`, `DialogBackdrop`, `DialogPanel` |
| Styling | SCSS Modules |

### UI

- Full-viewport backdrop with configurable color.
- Centered `DialogPanel`; content is entirely caller-defined (`children`).
- Enter/leave transitions unless `disableAnimation={true}`.

### Behavior

- Controlled by `open` / `onClose`.
- Closes on Escape and backdrop click (Headless UI default).
- `initialFocus` — optional ref for first focused element when opened.

### Accessibility

- `aria-label` and/or `aria-describedby` passed to Headless `Dialog`.
- Focus trap and restore handled by Headless UI.

### Storybook

- Title: `Shared/Dialog`
- File: `dialog.stories.tsx`
- Stories: Desktop/Tablet/Mobile (static open), CustomBackdrop, Interactive variants, FocusTrapTest, InitialFocus.

### Tests

- Unit: `specs/dialog.spec.unit.tsx`
- Snapshot: `specs/dialog.spec.snap.tsx`

### Usage

- `shared/ui/confirm-dialog/confirm-dialog.tsx` — wraps `Dialog` with title, description, and action buttons.

---

## ConfirmDialog

### Purpose

App-wide imperative confirmation modal. Callers use `useConfirm()` to show a promise-based dialog (delete list, validation alerts, etc.). Mounted once at app root via `ConfirmDialogProvider`.

### Location

`shared/ui/confirm-dialog/`

### Files

- `confirm-dialog-provider.tsx` — context provider + promise resolver; **default export, mounted in `main.tsx`**.
- `hooks/use-confirm.ts` — `useConfirm()` hook; exported from `@shared`.
- `contexts/confirm-dialog-context.tsx` — `ConfirmOptions`, `ConfirmContext`.
- `confirm-dialog-logic-layer.tsx` — maps options → presentational dialog, default button labels.
- `confirm-dialog.tsx` — title, description, Cancel/Confirm buttons inside `Dialog`.
- `confirm-dialog.module.scss` — dialog content layout.

### Props

**Public API — `useConfirm()`:**

```typescript
type ConfirmOptions = {
  title: ReactNode;
  description?: ReactNode;
  confirmationText?: string;  // default: "Confirm"
  cancellationText?: string;  // default: "Cancel"
  hideCancelButton?: boolean; // alert-style, single OK button
};

type UseConfirm = (options: ConfirmOptions) => Promise<boolean>;
```

- Resolves `true` on confirm, `false` on cancel, backdrop dismiss, or Escape.
- Opening a new dialog while one is open resolves the previous promise with `false`.

**Internal — `ConfirmDialog` presentation** (not exported): `open`, `title`, `description`, `confirmationText`, `cancellationText`, `hideCancelButton`, `onConfirm`, `onCancel`, `onClose`, `ariaLabel`.

### Tech stack

| Category | Technology |
|----------|------------|
| UI | Headless UI via shared `Dialog`; shared `Button` for actions |
| Styling | SCSS Modules |

### UI

- Panel: title (`h2`), optional description, row of Cancel (secondary) + Confirm (primary).
- `hideCancelButton` — single primary button, right-aligned (`singleButton` layout).
- Uses `Dialog` with `disableAnimation={true}`.

### Behavior

1. App wraps tree in `<ConfirmDialogProvider>` (`main.tsx`).
2. Feature code: `const confirmDialog = useConfirm();` then `const ok = await confirmDialog({ title: '...', ... });`.
3. Provider renders one modal instance; logic layer supplies default labels and derives `ariaLabel` from string `title`.

### Accessibility

- Dialog `aria-label` from string `title`, or `"Confirmation dialog"` for non-string titles.
- Cancel and Confirm are labeled buttons; focus trap via underlying `Dialog`.
- `useConfirm()` throws if called outside `ConfirmDialogProvider`.

### Storybook

- Title: `Shared/ConfirmDialog`
- File: `confirm-dialog.stories.tsx`
- Stories: Desktop/Tablet/Mobile (auto-open), AlertStyle (`hideCancelButton`), Interactive variants.

### Tests

- Unit: `specs/confirm-dialog.spec.unit.tsx` — promise resolve, custom labels, alert mode, outside-provider throw.
- Snapshot: `specs/confirm-dialog.spec.snap.tsx`

### Usage

- `main.tsx` — global `ConfirmDialogProvider`.
- `pages/home/ui/home-page-logic-layer.tsx` — delete workout list confirmation.
- Tests/stories wrap consumers in `ConfirmDialogProvider` (see `app/model/specs/test-utils.tsx`).
