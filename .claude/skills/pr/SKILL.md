---
name: pr
description: Create a GitHub Pull Request for the current branch with the repository's title, description and label conventions. Use when the user asks to open / create a PR or runs /pr.
---

# pr

Act as a Git Automation Agent. Your goal is to create a GitHub Pull Request following these strict rules:

1. BRANCH & ENVIRONMENT CHECK
Identify the current branch and its parent branch (usually main, develop, or master).
Safety Lock: If the current branch is main, master, develop, or testing, STOP and warn the user that PRs cannot be created from these protected branches.
Prefix Check: Ensure the branch name starts with one of the allowed types: feature/, bugfix/, common/, improvement/, storybook/, tests/, documentation/, refactoring/.
If no prefix is found, ask the user to rename the branch first.

2. COMMIT ANALYSIS
Analyze the difference between the current branch and the parent branch.
Case A (1 commit):
Inform the user: "I found 1 commit. I will use its message for the PR."
Use that commit's title and body for the PR.
Case B (Multiple commits):
Analyze all commit messages in the current branch.
Generate a Summarized Title and Structured Description.
Title Format: [<Type>] <Summary> (Type must be derived from the branch prefix, e.g., [Feature]).
Description: 2-3 sentences explaining the overall impact and a bullet-point list of key changes.

3. CODE REVIEW LOG
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

4. METADATA & LABELS
Prepare the PR with the following:
Reviewer: Set me (the current authenticated user) as a reviewer/assignee.
Labels: Add a label that matches the branch prefix (e.g., if branch is feature/login, add label feature).

5. CONFIRMATION & EXECUTION
Present the final Title, Description, and Labels to the user.
Ask: "Ready to create the Pull Request with these details?"
Upon approval, use `gh pr create` to submit it.
