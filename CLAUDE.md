# Claude Code Instructions

## Completing GitHub Issues

After finishing work on a GitHub issue:

1. Commit all changes with a message referencing the issue (e.g. `Resolves #4`)
2. Push the branch to origin
3. Create a pull request using the GitHub MCP tools targeting `main` with:
   - A clear title summarizing the change
   - A body that includes `Closes #<issue-number>` so GitHub auto-closes the issue on merge
