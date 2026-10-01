---
description: Storybook — one stories file next to every component, titles by FSD layer, showcase stories, viewports, Chromatic
paths:
  - "client/src/**/ui/**"
  - "client/src/**/*.stories.tsx"
  - "client/.storybook/**"
---

# Storybook

Every component has one `*.stories.tsx` next to it; the story is the component's visual contract and the input of
Chromatic. Few stories per component, each showing one axis or one state, not one story per prop combination.

## One file per component

- `<component>.stories.tsx` sits in the component's folder, next to `<component>.tsx`. The data / logic / provider
  layers (`*-data-layer`, `*-logic-layer`, `*-provider`) belong to the same component and get no file of their own;
  the story renders the layer that shows the states with mocked props — the logic layer or the presentation. A data
  layer or provider is rendered only when it holds client-only state (`toaster-data-layer` reads the theme store,
  `confirm-dialog-provider` owns the dialog state), never one with server queries.
- `title` is the literal `'<Layer>/<ComponentName>'`: the FSD layer in PascalCase (`Pages`, `Widgets`, `Features`,
  `Entities`, `Shared`) and the component name in PascalCase — `'Shared/IconButton'`, `'Pages/HomePage'`. No
  variable, no slice or folder in the path (the sidebar is sorted by layer, see `.storybook/preview.tsx`).
- Helpers shared by stories live in `client/.storybook/`: `showcase.tsx` (`Frame`, `Row`, `Grid`, `Stack`, `Panel`,
  `Caption`, the `withFrame` decorator), `render-with-router.tsx` (a `shared` component around router `Link`s),
  `render-with-page-router.tsx` (a page: query client, confirm provider, routes), `helpers.ts` (viewport stories),
  `fixtures/` (mock entities).

## Shape of a `shared` story

```typescript
const meta = {
  title: 'Shared/Button',
  component: Button,
  args: { children: 'Save' },                   // the required props once
  decorators: [withFrame],                      // app background and padding
  parameters: { docs: { description: { component: 'One or two sentences: what it is, what the props mean.' } } },
} satisfies Meta<typeof Button>;

/** Primary, medium: the everyday form. */       // JSDoc on every story — autodocs shows it
export const Default: Story = {};

/** `primary` confirms, `secondary` steps aside, `danger` destroys. */
export const Variant: Story = {
  render: (args): ReactElement => <Row>{VARIANTS.map((variant: Variant) => <Button {...args} variant={variant} />)}</Row>,
};
```

- `Default` plus one story per axis (`Variant`, `Size`, `Matrix`) and one per state (`Disabled`, `States`, `Open`).
  A matrix is one `render` mapping a local constant array into a `Row` / `Grid`.
- A state that needs a user action (an open menu, a dialog, a toast, a visible password) is reached through `play`
  from `@storybook/test`, so the snapshot shows the open state, not the trigger.
- Local state goes into a small `FC` demo (`StatefulSelect`) rendered by the story; the meta of such a component is
  annotated `Meta<typeof X>` instead of `satisfies`, so stories without `args` type-check.
- No inline `style`: the `showcase` wrappers, or a `<component>.stories.module.scss` for classes the story itself
  needs (transition classes, a demo box).
- One viewport (the default) for `shared` components.
- The Accessibility panel (`@storybook/addon-a11y`, axe) is green on every story: a violation is fixed in the
  component, not hidden in the story.

## Pages, widgets, entities

- Pages render in every viewport: stories built with `buildDesktop4KStoryObj` / `buildDesktopStoryObj` /
  `buildTabletStoryObj` / `buildMobileStoryObj` from `storybook-dir/helpers`, named `<State><Viewport>` (`Desktop`,
  `PreviewMobile`). A page with several states shows the main one in all four viewports and the others where they
  matter.
- Widgets pick their viewports by what the widget is: a bottom bar is mobile-first, a footer is shown in all four.
- Pages render through `.storybook/render-with-page-router.tsx` (`renderWithPageRouter`, `renderWithAuthRouter` for
  the auth forms) with fixtures from `.storybook/fixtures/` and `fn()` callbacks. Pages and widgets never render a
  data layer: theirs hold the queries.

## Chromatic

- Chromatic snapshots every story, so a matrix story covers all its variants in one snapshot and `play` decides
  what the snapshot shows.
- Chromatic honours the story's `viewport.defaultViewport`, which is what the `build*StoryObj` helpers set.
- Nothing in a story depends on time, randomness or the network: fixtures and `fn()` only.

## Enforcement

| Rule | Checked by |
|---|---|
| A `<component>.stories.tsx` next to every component of a `ui` segment (layers count as the component); no orphan story | `npm run client:lint` · `client/scripts/check-stories.mjs` |
| `title` is the literal `'<Layer>/<ComponentName>'` | `npm run client:lint` · `client/scripts/check-stories.mjs` |
| Page stories cover `Desktop4k`, `Desktop`, `Tablet` and `Mobile` | `npm run client:lint` · `client/scripts/check-stories.mjs` |
| Stories compile and render | `npm run client:build-storybook` |
| `Default` + one story per axis / state, matrices in `Row` / `Grid`, JSDoc on every story | ❌ review |
| User-driven states reached through `play` | ❌ review |
| The Accessibility panel is green on every story | ❌ review |
| No inline `style`; wrappers from `client/.storybook/showcase.tsx` or a `*.stories.module.scss` | ❌ review |
