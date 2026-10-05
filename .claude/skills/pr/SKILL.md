---
name: pr
description: Create a GitHub Pull Request for the current branch with the repository's title, description and label conventions, linked to its task (issue) with the acceptance criteria as checkboxes. Use when the user asks to open / create a PR or runs /pr.
---

# pr

Act as a Git Automation Agent. Your goal is to create a GitHub Pull Request following these strict rules:

1. BRANCH & ENVIRONMENT CHECK
The branch rules live in `.claude/skills/branches/SKILL.md` (`/branches`); follow it, including its gate.
Identify the current branch and its base, given by the branch name (branches §3): `develop`, or the shared branch of a `--<n>` sub-branch.
Safety Lock: If the current branch is protected (branches §1), STOP and warn the user that PRs cannot be created from it — promotion PRs belong to `/release`.
Prefix Check: Ensure the branch name is `<type>/<name>` with a work type from branches §2.
If it is not, STOP and propose a rename; renaming (and pushing the renamed branch) waits for the user's yes (branches §4).
If the branch is not on `origin` yet, its first push (branches §5) is part of the confirmation in step 6.
Task Check: a branch of a task carries the issue number (branches §2: `feature/workout-export-12--2` → `12`). Read it
with `gh issue view <N> --json state,title,url,body`; a missing or closed issue → STOP and ask. The task model lives
in `.claude/skills/analyst/SKILL.md` §1 (`/analyst`).

2. COMMIT ANALYSIS
Analyze the difference between the current branch and its base (step 1).
Case A (1 commit):
Inform the user: "I found 1 commit. I will use its message for the PR."
Use that commit's title and body for the PR.
Case B (Multiple commits):
Analyze all commit messages in the current branch.
Generate a Summarized Title and Structured Description.
Title Format: <prefix> <Summary> — the title prefix of branches §2 (`[Feature]`, `[12][Feature]`, `[12][Feature][2]`, `[Common][1]`).
Description: 2-3 sentences explaining the overall impact and a bullet-point list of key changes.

3. TASK
Only for a branch of a task (step 1); without one, skip this step.
The description starts with one line that links the task, by the base:
- base `develop` (a task branch or its shared branch): `Closes #<N>` — the PR is linked to the issue, and merging it
  closes the issue and moves the card to Done;
- base a shared branch (a sub-branch): `Part of #<N>` — a plain reference; the status stays In progress.

A PR into `develop` also carries the acceptance criteria, after the key changes and before `## Code review`. Copy
every `- **AC-<n>** …` line of the issue's `## Acceptance criteria` section (`/analyst` §1 The issue) verbatim as an
unticked checkbox:
```
## Acceptance criteria

From #<N> — ticked by the user on acceptance.

- [ ] **AC-1** Given … When … Then …
- [ ] **AC-2** …
```
The issue has no such section (filed by hand) → the section says `_Issue #<N> has no acceptance criteria._`; tell the
user when presenting the description. Never tick a box: acceptance is the user's. A PR of a sub-branch has no such
section.

4. CODE REVIEW LOG
`/code-review` keeps its findings per branch in `.runtime/code-review/<slug>.md` (gitignored), where `<slug>` is the
branch name with `/` replaced by `--` (`feature/login` → `feature--login.md`); its format is defined in
`.claude/skills/code-review/SKILL.md`. Read that file (never modify it) and end the PR description with a
`## Code review` section:

Case A (the file exists):
```
## Code review

Rounds: <N> · last: <date> · scope: <scope> · last verdict: <verdict from the last `## Rounds` entry>
Open: 🔴 <count> 🟠 <count> 🟡 <count> · fixed: <count> · wontfix: <count>

<the findings table copied verbatim, every row and every column including Status>
```
Case B (no file): the PR must say so explicitly:
```
## Code review

_No /code-review run was recorded for this branch._
```
Report the same fact to the user when presenting the description: open blockers in the log are worth mentioning
before the PR is created, but the decision is theirs.

5. METADATA & LABELS
Prepare the PR with the following:
Reviewer: Set me (the current authenticated user) as a reviewer/assignee.
Labels: Add the label of the branch type (branches §2: `feature/login` → `feature`).

6. CONFIRMATION & EXECUTION
Present the final Base, Title, Description, Labels and the task (number, title, link) to the user.
Ask: "Ready to create the Pull Request with these details?"
Upon approval, push the branch if needed and use `gh pr create --base <base>` to submit it.
A PR of a task into `develop`: then read the task's status (`/analyst` §1 Setting a field); unless the board
workflow already moved it, set `Status` = In review. A sub-branch PR leaves the status alone.
