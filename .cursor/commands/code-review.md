# code-review

Act as a senior software engineer. Perform a rigorous code review of the changes since the last commit.

**Important:** First run `git diff HEAD` to get all changes (staged + unstaged) since the last commit. Review ONLY the changed lines (the diff), not the entire files.

Focus on:
1. Potential bugs, edge cases, and logical errors.
2. Code style, readability, and adherence to DRY/SOLID principles.
3. Security vulnerabilities (leaked secrets, injection points).
4. Performance bottlenecks or unnecessary re-renders.
5. Suggestions for better naming or simplified logic.

Output your feedback as a concise list of actionable improvements. If everything looks solid, give me a "Ready to commit" signal.

This command will be available in chat with /code-review
