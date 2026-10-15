---
name: branches
description: The repository's branch model (main ← testing ← develop, <type>/<name> work branches with an optional <issue>- number prefix in the name, shared branches and their <name>--<n> sub-branches, the parent branch of a parent issue and the branches of its sub-issues, the release branches), the commit / PR title prefix, the task folder in .runtime/tasks/, the branch type ↔ PR label table, how to find the base of a branch, and the approval gate for every branch operation. Use before creating, switching, renaming, deleting, pushing, resetting, rebasing or merging a branch, when starting work on an issue or a sub-issue, when a skill needs the branch / title / base / label rules (/commit, /pr, /release), or when the user runs /branches.
---

# branches

The single source of the branch rules: `/commit`, `/pr` and `/release` refer here instead of repeating them.

## 1. Branch model

```
main  ←  testing  ←  develop  ←  <type>/<name>
                             ←  <type>/<name>  ←  <type>/<name>--1, <type>/<name>--2, …
                             ←  <type>/<P>-<name>  ←  <type>/<N>-<name>  ←  <type>/<N>-<name>--1, …
```

| Branch | Role | Changes only through |
|---|---|---|
| `main` | production; every GitHub Release `vX.X.X` is tagged on it | `/release` PR `testing` → `main` |
| `testing` | pre-release check; branched from `main` | `/release` PR `develop` → `testing` |
| `develop` | integration; branched from `testing`; the default base of all work | merged PRs |
| `<type>/<name>` | one task: a feature, a fix, a doc change; branched from `develop`, PR into `develop` | commits of the task; for a **shared branch**, merged PRs of its sub-branches |
| `<type>/<name>--<n>` | a **sub-branch**: one part of a task `/developer` cuts into parts (its step 3); branched from `<type>/<name>`, PR into it | commits of the part |
| `<type>/<P>-<name>` | a **parent branch**: the branch of a parent issue split into sub-issues (`/analyst` §1 Big work); branched from `develop`, PR into `develop` once every sub-issue is in | merged PRs of its sub-issue branches |
| `<type>/<N>-<name>` of a sub-issue | branched from the parent branch, PR into it; a big one is a shared branch itself | commits of the sub-issue, or merged PRs of its sub-branches |

- `main`, `testing` and `develop` are **protected**: never commit on them, never push to them, never open a PR from
  them — except the promotion PRs of `/release`.
- A work branch starts from the latest `origin/<base>` (§3) and goes back into it by a PR (`/pr`).
- Depth: parent → sub-issue → `--<n>` (the issues by `/analyst` §1 Big work); a sub-branch has no sub-branches, a
  branch without a task has no parent. The parent branch keeps a half-done parent out of `develop` — and out of a
  release.
- A shared or parent branch takes no commits of its own, and others build on it: never force-push, rebase or reset
  it; a newer base comes in by a merge (`git merge origin/<base>`, gated — §4).
- Release branches (created only inside `/release`, PR into `develop`):
  - `common/version-increase` — the version bump; `update-version` rewrites it on every release (`/release`
    Phase A), so never commit anything else on it.
  - `common/release-notes-update-vX.X.X` — the `RELEASE-NOTES.md` entry of a published release, from
    `origin/develop`.

Parent issue #109 with sub-issues #110–#112:

```
develop
 └─ feature/109-multi-language                 ← parent branch; PR into develop closes #109–#112
     ├─ feature/110-language-choice            ← sub-issue; PR into feature/109-multi-language
     ├─ improvement/111-server-error-codes     ← sub-issue of its own type, worked at the same time
     └─ feature/112-every-screen-translated    ← a big sub-issue, a shared branch of its own
         ├─ feature/112-every-screen-translated--1
         └─ feature/112-every-screen-translated--2
```

## 2. Types and labels

A work branch is `<type>/<name>`: `<type>` from the table, `<name>` short kebab-case by purpose (3–4 words)
(`bugfix/workout-list-menu-click-navigation`, `common/setup-skill`). A branch of a task — an issue, see `/analyst` §1 —
starts its name with the issue number: `<type>/<N>-<name>` (`feature/12-workout-export`), the form GitHub itself
proposes for a branch of an issue; a branch without a task has no number (`/analyst` §1). A sub-branch appends `--<n>`,
a number from 1, after everything (`feature/new-ui-component--1`, `feature/12-workout-export--1`), and keeps the type
and the task of its shared branch.

A parent branch and a sub-issue branch are branches of a task like any other, each with its own issue's number and
label (`feature/109-multi-language`, `feature/110-language-choice`); that `#110` is a sub-issue of `#109` is in the
issue, not the name (§3).

Reading the numbers from a name: leading digits followed by `-` right after `<type>/` are the issue number, a
trailing `--<n>` is the sub-branch number (`feature/12-workout-export--2` → task 12, sub-branch 2;
`common/some-changes--1` → no task, sub-branch 1). So a name without a task must not start with `<digits>-`
(`common/upgrade-node-24`, not `common/24-node`).

The type is also the PR label (see `/pr`) and, with the two numbers, the prefix of every commit and PR title
(`/commit`, `/pr`): the issue number before the type, the sub-branch number after it.

The same key names the branch's **task folder** and its **worktree**:

- `<key>` is the issue number, or for a branch without a task the branch name with `/` replaced by `--`.
- Task folder — the gitignored `.runtime/tasks/<key>/` **of the main checkout**, where `/developer` keeps its
  artifacts and `/code-review` its log; a sub-branch works in `part-<n>/` inside the folder of its shared branch.
  A parent issue and each sub-issue have folders of their own (`.runtime/tasks/109/`, `.runtime/tasks/110/`).
  Every worktree reads and writes the same folder, so a task resumes from any checkout. The main checkout,
  `<main>`, is the first entry of `git worktree list`.
- Worktree — `.claude/worktrees/<key>/` (gitignored) **of the main checkout**, when the branch lives in its own worktree
  (§5); a sub-branch gets `.claude/worktrees/<key>--<n>/`. A worktree command names it from the main checkout,
  `<main>/.claude/worktrees/<key>` — a relative path from inside another worktree would nest the new one in it, and
  removing that one would take the nested one along.

| Branch | Title prefix | Task folder (main checkout) | Worktree |
|---|---|---|---|
| `feature/12-workout-export` | `[12][Feature] …` | `.runtime/tasks/12/` | `.claude/worktrees/12/` |
| `feature/12-workout-export--2` | `[12][Feature][2] …` | `.runtime/tasks/12/part-2/` | `.claude/worktrees/12--2/` |
| `common/some-changes` | `[Common] …` | `.runtime/tasks/common--some-changes/` | `.claude/worktrees/common--some-changes/` |
| `common/some-changes--1` | `[Common][1] …` | `.runtime/tasks/common--some-changes/part-1/` | `.claude/worktrees/common--some-changes--1/` |
| `feature/109-multi-language` (parent) | `[109][Feature] …` | `.runtime/tasks/109/` | `.claude/worktrees/109/` |
| `feature/110-language-choice` (sub-issue of #109) | `[110][Feature] …` | `.runtime/tasks/110/` | `.claude/worktrees/110/` |
| `feature/112-every-screen-translated--1` | `[112][Feature][1] …` | `.runtime/tasks/112/part-1/` | `.claude/worktrees/112--1/` |

| Label | Used for | Description in the repo |
|---|---|---|
| `feature` | work branch `feature/*` | New functionality |
| `bugfix` | work branch `bugfix/*` | Fix of some bugs |
| `improvement` | work branch `improvement/*` | Improvement of existing functionality |
| `refactoring` | work branch `refactoring/*` | Code refactoring |
| `common` | work branch `common/*`, both release branches | Dependencies update, some libraries configuration, version increase etc |
| `documentation` | work branch `documentation/*` | Improvements or additions to documentation |
| `storybook` | work branch `storybook/*` | Stories for components |
| `tests` | work branch `tests/*` | Unit tests, e2e-tests, mock data etc |
| `testing` | PR `develop` → `testing` only | PR from 'develop' to 'testing' |
| `release` | PR `testing` → `main` only | PR before release of new app version |

`testing` and `release` are never branch prefixes. The labels live in the repository (`gh label list`); a new type
means a new label there, a new row here and the type in the `argument-hint` of `/commit` (frontmatter cannot link).

## 3. The base of a branch

By the name first, then by the issue:

1. No issue number in the name (`common/some-changes`, `common/some-changes--1`):
   - a trailing `--<n>` → the same name without it (`common/some-changes--1` → `common/some-changes`);
   - otherwise → `develop`.
2. An issue number in the name (`<type>/<N>-<name>`):
   - a trailing `--<n>` → the same name without it (`feature/12-workout-export--2` → `feature/12-workout-export`,
     `feature/112-every-screen-translated--1` → `feature/112-every-screen-translated`);
   - otherwise → `## Parent` of issue `#<N>` (`gh issue view <N> --json body`; an older issue without
     the section — `gh issue view <N> --json parent --jq .parent.number`, `/analyst` §1 The issue). A parent `#<P>`
     → its branch, `git ls-remote --heads origin '*/<P>-*'` with names ending in `--<n>` left out
     (`feature/110-language-choice` → `feature/109-multi-language`);
   - no parent → `develop`.

A base taken off a name must exist on `origin` (`git ls-remote --heads origin <base>`); if it does not, stop and
ask. A parent with no branch on `origin` → stop: the parent branch is not created yet, `/developer` (step 2)
proposes it first (§5). Several branches of the parent, or the parent issue closed → stop and ask. Never fall back to
`develop` on your own (§1).

The branch already has a PR with another base (`gh pr view --json baseRefName -q .baseRefName`) → show both and ask.

The base is what `/pr` targets (`--base`). A comparison with it — `/code-review origin/<base>`, `/pr` step 2 — goes
from the fork point with `origin/<base>` after `git fetch origin <base>` (`git merge-base origin/<base> HEAD`,
`/code-review` §1): a shared or parent branch moves on GitHub, by merged PRs, while its local ref stays behind.

## 4. The gate

Every operation that creates, moves or removes a branch, or rewrites what it points to, waits for the user's
explicit yes **for that operation**:

- create (`git checkout -b`, `git switch -c`, `git branch <name>`, `gh issue develop` — it creates the branch on
  `origin`), switch (`checkout` / `switch`), rename, delete (local or remote);
- `git push` of any kind (first push, `--force-with-lease`), setting or changing an upstream;
- `reset`, `rebase`, `merge` / `pull` into a branch, `cherry-pick`;
- `git stash` / `stash pop` done to switch branches;
- `git worktree add` / `git worktree remove`.

How:

1. Say what you will run and why, in one line each: `git switch --no-track -c common/branches-skill origin/develop
   — a branch for the branches skill`. Propose the branch name and the base; the user may change either.
2. Wait for the answer. Silence, "ok to the plan" or an approval of an earlier operation is not a yes for this one.
3. The user naming the operation is the yes ("stash it and go to develop" approves exactly that stash and that
   switch — not the branch that comes next).

Without the gate: reading (`git status`, `branch`, `log`, `diff`, `show`, `rev-parse`, `ls-remote`), `git fetch`,
and commits on the current non-protected branch through `/commit` (it asks for its own approval). The autonomous
PR horizon of `/developer` (its step 6) is one explicit yes for the pushes of the task branch and the `/pr` that
its gate line lists — they run without a second question.

## 5. Doing it safely

- **Dirty tree before a switch:** stop and ask — commit (`/commit`) or stash (`git stash push -u -m "<what>"`, so
  untracked files go too). Never discard changes, never `checkout -- .` / `reset --hard` someone's work.
- **New work branch** (a sub-issue's: the next item): `git fetch origin <base>`, then
  `git switch --no-track -c <branch> origin/<base>` with the base from §3:
  - `git switch --no-track -c feature/new-ui-component origin/develop`
  - `git switch --no-track -c feature/new-ui-component--1 origin/feature/new-ui-component`

  `--no-track` goes **before** `-c` (`-c` takes the next word as the branch name). Without it the branch tracks
  `origin/<base>`, and a bare `git push` would push the work into the base.
- **New sub-issue branch** — created on GitHub linked to its issue, then fetched:
  `gh issue develop <N> --base <parent branch> --name <branch>`, `git fetch origin <branch>`, then
  `git switch <branch>` (in a worktree: the next item) — it tracks `origin/<branch>`, its own branch. The link
  lists the branch and its PR in the issue's Development; a closing keyword cannot do that in a PR into the parent
  branch (`/pr` §3).
- **New work branch in a worktree** — the main checkout stays where it is, and several branches are worked on at once:
  `git fetch origin <base>`, then `git worktree add --no-track -b <branch> <main>/.claude/worktrees/<key> origin/<base>`
  (the folder by §2); a sub-issue's branch is created by «New sub-issue branch» and only checked out here,
  `git worktree add <main>/.claude/worktrees/<key> <branch>`. The worktree has no `node_modules` and no env files:
  run `npm ci` and `npm run setup:env` in it. A session moves into it with `EnterWorktree` (`path`). Removing it
  after its PR is merged — `git worktree remove <main>/.claude/worktrees/<key>` — is gated like any branch
  operation; the task folder stays.
- **Branches at the start** — `/developer` creates them in two steps, one gate line for each column; a branch
  already on `origin` is reused (the parent branch exists after its first sub-issue). The parent issue itself is not
  taken into work: its branch comes with its first sub-issue, created without switching
  (`git branch --no-track <parent branch> origin/develop`) and pushed at once.

  | Task (`## Parent`) | At the start (`/developer` step 2) | Cut into parts (`/developer` step 3) |
  |---|---|---|
  | a task | `feature/1-some-task` from `develop` | `feature/1-some-task` pushed → `feature/1-some-task--1` from it |
  | a sub-issue of #1 | `feature/1-some-parent` from `develop`, pushed → `feature/2-some-sub-issue` from it, linked to #2 | `feature/2-some-sub-issue` pushed → `feature/2-some-sub-issue--1` from it |
  | no task | `common/some-changes` from `develop` | `common/some-changes` pushed → `common/some-changes--1` from it |
- **Branch of a task** (`<type>/<N>-<name>`, not a sub-branch): this is where the task goes into work.
  - Before: `gh issue view <N> --json state,title,labels,body` must show an open issue; a closed or missing one →
    stop and ask. The type should match the issue label — a mismatch → ask. A `## Parent` → the parent issue must
    be open too.
  - The gate line names every step of its column, one yes for them, the card moves included:
    - a task: `git switch --no-track -c feature/12-workout-export origin/develop — a branch for #12 "Workout export
      to CSV", then #12 → In progress`;
    - a sub-issue, the parent branch not on `origin` yet: `git branch --no-track feature/109-multi-language
      origin/develop, git push -u origin feature/109-multi-language, gh issue develop 110 --base
      feature/109-multi-language --name feature/110-language-choice, git fetch origin feature/110-language-choice,
      git switch feature/110-language-choice — the parent branch of #109 and a branch linked to #110 "Language
      choice", then #109 and #110 → In progress`.
  - After the branches are created: the cards by `/analyst` §1 Statuses (`/analyst` §1 Setting a field).
- **Shared or parent branch to its PR** — every part or sub-issue merged into it: its local branch never moved (the
  merges happened on GitHub), so it is brought to the remote state where it is checked out, one gate line:
  `git fetch origin <branch>`; the checkout of `<branch>` from `git worktree list` (the main checkout or any
  worktree), or, when none has it, `git worktree add <main>/.claude/worktrees/<key> <branch>`; then
  `git -C <that checkout> merge --ff-only origin/<branch>` — then `/pr` there.
- **First push:** `git push -u origin <branch>` — the upstream is the branch itself.
- **Wrong branch for a change** (on a protected branch, or the type does not match): say so and propose the branch;
  don't create it on your own.
- **Coming back:** after a detour (stash → another branch → back), restore with `git stash pop` on the original
  branch and check `git status` — each of those steps is gated too.
