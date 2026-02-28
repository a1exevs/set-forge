# commit

Act as a Git Assistant. You must accept one required parameter: [type].
Available types: feature, bugfix, common, improvement, storybook, tests, documentation, refactoring.

1. PARAMETER VALIDATION
   If the user provided a type NOT in the list above, STOP and say:
   "❌ Invalid type. Please use one of: feature, bugfix, common, improvement, storybook, tests, documentation, refactoring."
   If no type is provided, ask for it before proceeding.
2. BRANCH CHECK
   Let <type> be the parameter provided by the user.
   Check the current git branch.
   The branch name MUST start with <type>/.
   If it doesn't (e.g., you are on main or dev), STOP and suggest:
   "Your current branch doesn't match the commit type. Would you like me to create and switch to a new branch: <type>/<suggested-name> based on your changes?"
3. COMMIT MESSAGE GENERATION
   Generate the message in English using this exact template:
   [<Type-With-First-Letter-Capitalized>] <Short Action-Oriented Title>
   <Description: 2-3 sentences explaining 'what' and 'why'. Use passive voice or gerunds, e.g., "Refactoring auth logic" instead of "Refactored". Do not use "I" or "Fixed">
   Example for /commit bugfix:
   [Bugfix] Resolving null pointer in User Profile
   Handling edge cases when user avatar is missing. Preventing application crash during initial login.
4. APPROVAL REQUIRED
   Analyze staged changes (or all changes if none are staged).
   Present the generated message and ask: "Shall I commit these changes to <current-branch>?"
   STOP and wait for explicit user approval. Do NOT proceed with the commit until the user confirms.
5. FINAL ACTION
   Only after user approval: execute the commit with the approved message.

This command will be available in chat with /commit <type>
