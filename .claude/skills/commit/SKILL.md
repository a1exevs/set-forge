---
name: commit
description: Commit the current changes with the repository's [Type] message template. Use when the user asks to commit, "закоммить", or runs /commit <type>.
argument-hint: "[feature|bugfix|common|improvement|storybook|tests|documentation|refactoring]"
---

# commit

Act as a Git Assistant. You accept one optional parameter: `[type]` (`$1`).
Available types: the work branch types of `.claude/skills/branches/SKILL.md` §2 (`/branches`) — the rows marked
"work branch" in its label table.

1. TYPE RESOLUTION
   If `$1` is given but NOT in the list above, STOP and say:
   "❌ Invalid type. Please use one of: <the work branch types of /branches §2, comma-separated>."
   If `$1` is empty, derive the type from the prefix of the current branch (`<type>/...`). If the branch has no such
   prefix, ask the user for the type before proceeding.
2. BRANCH CHECK
   Let <type> be the resolved type.
   Check the current git branch.
   The branch name MUST start with <type>/, and it must not be a protected branch (`/branches` §1).
   If it doesn't (e.g., you are on develop), STOP and suggest:
   "Your current branch doesn't match the commit type. Would you like me to create and switch to a new branch: <type>/<suggested-name> based on your changes?"
   Creating and switching wait for the user's yes and follow `/branches` (§4 gate, §5 new work branch); never do it
   on your own.
3. COMMIT MESSAGE GENERATION
   Generate the message in English using this exact template:
   [<Type-With-First-Letter-Capitalized>] <Short Action-Oriented Title>
   <Description: 2-3 sentences explaining 'what' and 'why'. Use passive voice or gerunds, e.g., "Refactoring auth logic" instead of "Refactored". Do not use "I" or "Fixed">
   Example for /commit bugfix:
   [Bugfix] Resolving null pointer in User Profile
   Handling edge cases when user avatar is missing. Preventing application crash during initial login.
   The `[<Type>]` part is the title prefix of `/branches` §2: on a branch of a task the issue number goes before
   the type, on a sub-branch its number goes after it — `feature/12-workout-export--2` →
   `[12][Feature][2] Adding the export button`. No `#` and no `Refs #N`: the task is linked by the PR (`/pr`).
4. APPROVAL REQUIRED
   Analyze staged changes (or all changes if none are staged).
   Present the generated message and ask: "Shall I commit these changes to <current-branch>?"
   STOP and wait for explicit user approval. Do NOT proceed with the commit until the user confirms.
5. FINAL ACTION
   Only after user approval: execute the commit with the approved message.
