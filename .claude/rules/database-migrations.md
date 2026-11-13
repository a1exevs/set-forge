---
description: Database migrations keep the previous release working — expand / contract, the @contract marker, the baseline
paths:
  - "server/database/migrations/**"
---

# Database Migrations

A production update (`npm run prod:update`, DEPLOY-SELECTEL.md) applies the migrations of the new release while the
previous release still serves, and the previous release is also the rollback target. So every migration leaves a
schema the previous release runs on.

## Expand / contract

- **Expand** — a migration that only adds: a table, a nullable column or one with a default, an index, a copy of
  data into a new column. Safe in any release.
- **Contract** — a migration that narrows the schema: drops or renames a table or a column, changes a column's type
  or makes it stricter (`NOT NULL`, a shorter length). It goes in a later release than the code that stopped using
  what it removes:
  1. release N — expand, and the code writes both shapes and reads the new one;
  2. release N+1 — contract: the code of release N no longer reads the old shape.
- A contract migration says so in a comment: `@contract vX.Y.Z` — the release whose code stopped using what it
  removes. The marker is the author's claim that the previous release does not need it; review checks the claim.
- Data the previous release reads is kept the same way: moved by an expand, deleted by a contract.

## Baseline

Migrations up to `20261104120000-opaque-refresh-tokens.js` predate this rule and are history: never rewritten, never
checked. The check reads the newer ones only.

## Enforcement

| Rule | Checked by |
|---|---|
| A migration whose `up` narrows the schema carries `@contract vX.Y.Z` | `npm run lint:root` · `scripts/check-migrations.ts` |
| The marked release really stopped using what the migration removes; data the previous release reads is kept | ❌ review |
