# Set Forge — Cursor context

## Principles

- Specs describe **current code state** (no Stage N, no delivery roadmap).
- Entity specs own API contracts; page specs link via `## API usage`.
- Rules in `.cursor/rules/` are immutable conventions.

## Specs layout

| Folder | Pattern | Purpose |
|--------|---------|---------|
| `specs/entities/` | `*.entity.spec.md` | DB, API, client entity |
| `specs/pages/` | `*-page.spec.md` | UI, page logic |
| `specs/shared/` | `shared-components.spec.md` | `shared/ui` catalog |

## Entity specs

- [user](specs/entities/user.entity.spec.md)
- [workout-list](specs/entities/workout-list.entity.spec.md)
- [workout-exercise](specs/entities/workout-exercise.entity.spec.md)
- [workout-session](specs/entities/workout-session.entity.spec.md)
- [workout-session-exercise](specs/entities/workout-session-exercise.entity.spec.md)

## Page specs

- [auth](specs/pages/auth-page.spec.md)
- [home](specs/pages/home-page.spec.md)
- [profile](specs/pages/profile-page.spec.md)
- [history](specs/pages/history-page.spec.md)
- [create-workout](specs/pages/create-workout-page.spec.md)
- [edit-workout](specs/pages/edit-workout-page.spec.md)
- [workout-mode](specs/pages/workout-mode-page.spec.md)

## Shared components

- [shared-components](specs/shared/shared-components.spec.md)

## Rules

| Rule | Scope |
|------|-------|
| [server-api](rules/server-api.mdc) | NestJS API, DTO, Swagger |
| [entity-specs](rules/entity-specs.mdc) | `specs/entities/` |
| [page-specs](rules/page-specs.mdc) | `specs/pages/` |
| [shared-component-specs](rules/shared-component-specs.mdc) | `specs/shared/` |
| [component-architecture](rules/component-architecture.mdc) | Client 3-layer pattern |
| [fsd-architecture](rules/fsd-architecture.mdc) | FSD imports |
| [state-management](rules/state-management.mdc) | React Query / Zustand |
| [file-naming](rules/file-naming.mdc) | kebab-case files |
| [styling-guidelines](rules/styling-guidelines.mdc) | SCSS modules |
| [typescript-guidelines](rules/typescript-guidelines.mdc) | TypeScript |
| [component-typing](rules/component-typing.mdc) | FC / Props |

## Adding new artifacts

- New entity → `specs/entities/<name>.entity.spec.md` + update this index + `## Used by` in page specs
- New page → `specs/pages/<name>-page.spec.md` + `## Used by` in entity spec + this index
- New shared component → section in `shared-components.spec.md` + Overview table
