---
description: Domain docs — what they hold (intent, invariants backed by tests, flows, a map to the code) and what they never duplicate
paths:
  - "docs/**"
  - "client/src/entities/**"
  - "client/src/features/**"
  - "client/src/pages/**"
  - "client/src/widgets/**"
  - "server/src/**"
---

# Domain Docs

`docs/domains/<domain>.md` explains a business domain in words the code can't: its purpose, terms, rules with their
reasons, and flows across slices or client and server. For anything concrete they point to the code.

## Before changing code

Find the doc whose **Map** lists the path you touch and read it. When the change alters an invariant or a flow,
update the doc and the test in the same change; a new entity slice, feature, page, widget, server module or model
goes into a Map.

## What a doc holds

Fixed sections, in this order:

- `# <Domain>` — two to four sentences: what the domain is for.
- `## Glossary` — domain terms, one line each.
- `## Invariants` — `| Id | Invariant |`: a kebab-case id and a business rule in plain words. The tests that prove it
  carry `// @invariant <domain>/<id>` (above the `it` / `describe`); a rule no test proves ends with `❌ review`.
  Wrote a test for a `❌ review` rule? Tag it and drop the marker — the lint insists.
- `## Flows` — user-visible flows across slices or client and server, a few steps each, in business words.
- `## Map` — `| Part | Code |`: slice folders, server modules, the service holding the rules, the models, the
  controller as the HTTP contract.
- `## Related` — optional: other domain docs, rules.

## What a doc never holds

Everything the code or its tooling already states: DB columns (models, migrations), file lists (the folder), props
(components, Storybook), DTOs and endpoints (controllers, Swagger), hook lists (the slice `index.ts`), component
catalogs (`client/src/shared/ui/index.ts`, Storybook). Point to a folder or a file — never to lines or symbols that
get renamed. No change logs or task plans: plans live in the PR, history in git.

## Enforcement

| Rule | Checked by |
|---|---|
| Fixed sections, one title, size limit | `npm run client:lint` · `client/scripts/check-domain-docs.mjs` |
| Every path in a doc exists | `npm run client:lint` · `client/scripts/check-domain-docs.mjs` |
| Invariants ↔ tests: tagged ⇔ not `❌ review`; every tag names an existing invariant, only in test files | `npm run client:lint` · `client/scripts/check-domain-docs.mjs` |
| Every client entity, feature, page, widget, every server domain module and model is in a Map | `npm run client:lint` · `client/scripts/check-domain-docs.mjs` |
| A tagged test really proves its invariant | ❌ review |
| The doc still tells the truth about rules and flows | ❌ review |
