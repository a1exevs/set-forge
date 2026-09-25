# Set Forge — Cursor context

## Principles

- The code is the source of truth. Docs hold only what the code can't say — intent, business rules with their
  reasons, cross-slice flows — and point to the code for everything concrete.
- Rules in `.cursor/rules/` are immutable conventions with one structure: frontmatter `description` / `globs` /
  `alwaysApply`, `# Title`, topic sections, optional `## Related`, and `## Enforcement` last (what checks each rule,
  or `❌ review`). `npm run client:lint` (`client/scripts/check-rules.mjs`) keeps that structure and every reference
  in Enforcement valid.
- No change logs or task plans in the repo: plans live in the PR, history in git.

## Domain docs

`docs/domains/*.md` — glossary, invariants (proven by tests tagged `// @invariant <domain>/<id>`, or marked
`❌ review`), flows and a map to the code.
Format: [domain-docs](rules/domain-docs.mdc); `npm run client:lint` (`client/scripts/check-domain-docs.mjs`) fails on
a broken path, a missing section or an unmapped slice / module.

| Domain | Doc |
|--------|-----|
| Session and account (auth, consents, re-consent, account deletion) | [session](../docs/domains/session.md) |
| Workout lists (templates, import / export) | [workout-list](../docs/domains/workout-list.md) |
| Workout sessions (training, progress, history) | [workout-session](../docs/domains/workout-session.md) |

## Rules

| Rule | Scope |
|------|-------|
| [server-api](rules/server-api.mdc) | NestJS API, DTO, Swagger |
| [domain-docs](rules/domain-docs.mdc) | `docs/domains/`, what domain docs hold and never duplicate |
| [component-architecture](rules/component-architecture.mdc) | Client data / logic / presentation layers |
| [fsd-architecture](rules/fsd-architecture.mdc) | FSD layers, slices, segments, imports |
| [state-management](rules/state-management.mdc) | React Query / Zustand |
| [file-naming](rules/file-naming.mdc) | kebab-case, names by purpose |
| [styling-guidelines](rules/styling-guidelines.mdc) | SCSS modules |
| [typescript-guidelines](rules/typescript-guidelines.mdc) | TypeScript |
| [component-typing](rules/component-typing.mdc) | FC / Props / JSX callbacks |
| [personal-data-compliance](rules/personal-data-compliance.mdc) | User PD, privacy policy, terms, doc versioning |

## Adding new artifacts

- New entity slice, feature, page or server module → add it to the Map of its domain doc (the lint fails otherwise).
- New domain → `docs/domains/<domain>.md` + a row in the table above.
- Changed business rule → update the invariant and its test in the same change.
