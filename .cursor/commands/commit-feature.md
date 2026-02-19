# commit-feature

Act as a Git Assistant. Analyze my current staged changes and follow these steps:

1. BRANCH CHECK:
   - Check my current git branch. 
   - If the branch name DOES NOT start with "feature/", suggest a new branch name using the pattern "feature/<feature-name>" based on the changes. Ask me to switch/create it first.

2. COMMIT MESSAGE GENERATION:
   - If the branch is correct, generate a commit message in English following this exact template:
     [Feature] <Short Action-Oriented Title>

     <Description: 2-3 sentences explaining 'what' and 'why'. Use passive voice or gerunds, e.g., "Adding validation logic" instead of "Added validation logic". Do not use "I" or "Fixed">

3. FINAL ACTION:
   - Present the message to me and ask for confirmation to commit.

This command will be available in chat with /commit-feature
