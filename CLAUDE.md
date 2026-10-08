# Set Forge — Claude Code context

## Principles

- The code is the source of truth. Docs hold only what the code can't say — intent, business rules with their
  reasons, cross-slice flows — and point to the code for everything concrete.
- Rules in `.claude/rules/` are immutable conventions with one structure: frontmatter `description` / `paths` (the
  globs that load the rule when a matching file is read), `# Title`, topic sections, optional `## Related`, and
  `## Enforcement` last (what checks each rule, or `❌ review`). `npm run client:lint`
  (`client/scripts/check-rules.ts`) keeps that structure and every reference in Enforcement valid.
- Skills in `.claude/skills/<name>/SKILL.md` are the repository workflows (`/setup`, `/analyst`, `/developer`,
  `/branches`, `/commit`, `/pr`, `/code-review`, `/privacy-audit`, `/release`); Claude also picks them up from a plain
  request ("write up this feature", "take #12 into work", "commit this", "make a release", "set up my machine").
  The stages of the pipeline are named by role (`/analyst`, `/developer`), the tools they use by action.
- Branch operations (create, switch, push, reset, …) wait for the user's yes, one by one — see `/branches`; the one
  exception is the autonomous PR horizon of `/developer`, whose gate names its pushes and PR in advance.
- Secrets (`.env*`, `secrets/`, `*.pem`, `*.key`) are denied to the agent in `.claude/settings.json`.
- No change logs or task plans in the repo: requirements live in GitHub issues on the Set-forge board (written by
  `/analyst`), plans and acceptance in the PR, history in git. Agent artifacts that must survive between runs
  (the `/developer` steps, the `/code-review` log and the stand check that `/pr` attaches to the description) live
  in the task folder `.runtime/tasks/<issue or branch>/` of the main checkout, shared by every worktree
  (`/branches` §2); `.runtime/` is gitignored.

## Domain docs

`docs/domains/*.md` — glossary, invariants (proven by tests tagged `// @invariant <domain>/<id>`, or marked
`❌ review`), flows and a map to the code.
Format: [domain-docs](.claude/rules/domain-docs.md); `npm run lint:root` (`scripts/check-domain-docs.ts`)
fails on a broken path, a missing section or an unmapped slice / module.

| Domain | Doc |
|--------|-----|
| Session and account (auth, consents, re-consent, account deletion) | [session](docs/domains/session.md) |
| Workout lists (templates, import / export) | [workout-list](docs/domains/workout-list.md) |
| Workout sessions (training, progress, history) | [workout-session](docs/domains/workout-session.md) |

## Rules

| Rule | Scope |
|------|-------|
| [server-api](.claude/rules/server-api.md) | NestJS API, DTO, Swagger |
| [domain-docs](.claude/rules/domain-docs.md) | `docs/domains/`, what domain docs hold and never duplicate |
| [component-architecture](.claude/rules/component-architecture.md) | Client data / logic / presentation layers |
| [fsd-architecture](.claude/rules/fsd-architecture.md) | FSD layers, slices, segments, imports |
| [state-management](.claude/rules/state-management.md) | React Query / Zustand |
| [file-naming](.claude/rules/file-naming.md) | kebab-case, names by purpose |
| [styling-guidelines](.claude/rules/styling-guidelines.md) | SCSS modules |
| [typescript-guidelines](.claude/rules/typescript-guidelines.md) | TypeScript |
| [component-typing](.claude/rules/component-typing.md) | FC / Props / JSX callbacks |
| [storybook](.claude/rules/storybook.md) | Stories next to components, titles by FSD layer, showcase, Chromatic |
| [personal-data-compliance](.claude/rules/personal-data-compliance.md) | User PD, privacy policy, terms, doc versioning |

## Adding new artifacts

- New entity slice, feature, page or server module → add it to the Map of its domain doc (the lint fails otherwise).
- New domain → `docs/domains/<domain>.md` + a row in the table above.
- Changed business rule → update the invariant and its test in the same change.
- New rule → `.claude/rules/<name>.md` in the shape above + a row in the Rules table. New workflow →
  `.claude/skills/<name>/SKILL.md`.
