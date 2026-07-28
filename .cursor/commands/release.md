# release

Act as a Release Automation Agent for this repository. Orchestrate the full release pipeline from README "Release steps" in **phases**. Never skip ahead. After every phase that requires a manual merge (or human review), STOP and wait for the user to say continue before starting the next phase.

## Parameter

Accept one required parameter: `[bump]`.
Available values: `patch`, `minor`, `major`.

If missing or invalid, STOP and ask for a valid bump type. Do not guess.

Usage: `/release patch` (or `minor` / `major`).

## Global rules

1. Source of truth for the flow: README.md section **Release steps**. Keep titles/branches exactly as specified there.
2. This command intentionally creates PRs between protected branches (`develop` → `testing` → `main`). Do **not** apply the `/pr` safety lock that forbids PRs from those branches.
3. Do **not** merge PRs yourself unless the user explicitly asks. After creating a PR, report the URL and wait.
4. Do **not** push to `develop`, `testing`, or `main` directly.
5. Do **not** include Selectel/deploy steps — out of scope.
6. Before any mutating git/`gh` action in a phase, briefly state what you will do and get approval for that phase (except when the user already said "continue" into a clearly defined next phase — then execute that phase, still confirming before publish/force-push style actions).
7. Track and reuse `vX.X.X` (without inventing a version). Prefer reading it from `client/package.json` after the bump, or from the version-increase PR/commit if resuming mid-flow.
8. Prefer `gh` for GitHub operations. Use `required_permissions: ["all"]` when push/network/`gh` need it.
9. If the user resumes mid-release (e.g. "continue after version PR merged"), detect the current phase from git/`gh` state and continue from the next incomplete phase. Ask only if ambiguous.
10. At each STOP, print a short status block:

```
Release status
- version: vX.X.X
- completed: Phase A … / Phase B …
- waiting for: <what the user must do>
- say: "continue" (or describe what was done) to proceed to Phase …
```

## Phase A — Version bump + PR into develop

Goal: bump version and open the version-increase PR.

1. Ensure working tree is clean. If not, STOP and ask the user to commit/stash.
2. Confirm bump type with the user if not already explicit in the command args.
3. Run: `npm update-version:<bump>`
   - This script checks out `common/version-increase`, resets to `origin/develop`, bumps, commits, and force-pushes with lease.
4. Read the new version from `client/package.json` → `vX.X.X`.
5. Create PR (if one is not already open):
   - head: `common/version-increase`
   - base: `develop`
   - title: `[Common] Version increase vX.X.X`
   - body: brief note that this is an automated version bump for release `vX.X.X`
6. **STOP.** Ask the user to review/merge that PR manually, then say `continue`.

## Phase B — Promote develop → testing

Precondition: version PR is merged into `develop` (verify via `gh pr view` / `git fetch` + compare). If not merged, STOP and say so.

1. `git fetch origin`
2. Create PR (if not already open for this release):
   - head: `develop`
   - base: `testing`
   - title: `[Testing] Release vX.X.X`
3. **STOP.** Wait for manual merge + `continue`.

## Phase C — Promote testing → main

Precondition: Phase B PR is merged into `testing`.

1. `git fetch origin`
2. Create PR (if not already open for this release):
   - head: `testing`
   - base: `main`
   - title: `Release vX.X.X`
3. **STOP.** Wait for manual merge + `continue`.

## Phase D — GitHub Release (tag + notes)

Precondition: Phase C PR is merged into `main`.

1. `git fetch origin`
2. Generate draft release notes (do not publish yet), e.g.:
   - `gh release create vX.X.X --target main --generate-notes --draft`
   - If the tag/release already exists as draft, edit/reuse it instead of duplicating.
3. Show the generated notes to the user. Remind them they may:
   - remove unnecessary notes
   - fix PR titles via PR editing if needed, then regenerate/edit notes
4. Ask approval to publish. On approval:
   - publish the release (e.g. `gh release edit vX.X.X --draft=false`, or create non-draft if still only a draft plan)
   - final release must be tagged `vX.X.X` and target `main` (published release on the mainline commit)
5. Fetch the final published notes text for Phase E (`gh release view vX.X.X --json body -q .body` or equivalent).
6. **STOP** only if publish failed or notes still need human edits; otherwise proceed to Phase E after confirming publish succeeded. If the user wants to tweak notes first, STOP until they say `continue` / `publish`.

## Phase E — Update RELEASE-NOTES.md

Precondition: GitHub Release `vX.X.X` is published; you have the final notes body.

1. Ensure clean working tree (or stash only with user approval). Start from latest `origin/develop`:
   - `git fetch origin`
   - create/switch branch: `common/release-notes-update-vX.X.X` from `origin/develop`
2. Prepend a new top section to `RELEASE-NOTES.md` matching existing style, e.g.:

```markdown
# Release vX.X.X
## What's Changed
<notes from GitHub Release>

**Full Changelog**: <compare URL if present in generated notes>

```

   Keep formatting consistent with prior entries in the file. Do not rewrite older releases.
3. Commit: `[Common] RELEASE-NOTES.md update vX.X.X`
4. Push branch and create PR:
   - head: `common/release-notes-update-vX.X.X`
   - base: `develop`
   - title: `[Common] RELEASE-NOTES.md update vX.X.X`
5. Report the PR URL. Release command is **done** after this PR is created (merge remains manual unless user asks).

## Resume / continue behavior

When the user says `continue`, `merged`, `done`, or similar:

1. Re-check git + `gh` state.
2. Mark completed phases.
3. Run only the next pending phase.
4. Never re-run a successful bump or re-create an already-open/-merged PR; reuse existing PR URLs.
5. If version is unknown, derive it from the latest version-increase commit/PR or `client/package.json` on `origin/develop`.

## Failure handling

- If `update-version` fails (dirty tree, push rejected, etc.), show the error and STOP; do not invent a workaround that skips the script.
- If a promote PR already exists, link it instead of opening a duplicate.
- If tag `vX.X.X` already exists on a different commit, STOP and ask the user how to proceed.

This command will be available in chat with /release <patch|minor|major>
