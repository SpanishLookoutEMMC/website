# Agent Guidelines

## Before you start

1. Read `README.md` before doing anything else.

## After each unit of work

2. Run the build script and verify it succeeds:
   ```bash
   npm run build
   ```
3. Manually test the feature or change you just made.
4. Commit your work:
   ```bash
   git commit
   ```
5. Check whether what you did contradicts anything in `README.md`. If so, update `README.md` to reflect the current truth.
6. Check whether your change is significant enough to document. If so, add or update the relevant section in `README.md`.

## When working on a feature branch

7. After each commit, push to the remote:
   ```bash
   git push
   ```
8. When you believe the work is complete, prepare for a PR:
   - Fetch the latest state of `main`:
     ```bash
     git fetch origin
     ```
   - Confirm the branch can be cleanly merged into `main`. If there are conflicts or your branch is behind, integrate the changes from `main` into your branch first (rebase or merge), then re-run the build and tests.
9. Open a pull request. Before opening, check whether a PR for this branch already exists and has been merged. If so, create a new branch and open a fresh PR rather than pushing to a merged branch.

## After merging a PR that changes page visuals

If the merged PR changed how any page looks, the VRT baselines on `main` are now stale. This is handled automatically:

1. The deploy workflow runs on `main` and VRT fails (expected — baselines predate the merged changes).
2. This failure automatically triggers the "Update VRT References" workflow, which regenerates all reference screenshots, commits them to `main`, and pushes.
3. The next CI run on `main` passes VRT.

No manual action is needed. You do not need to resolve merge conflicts in baseline PNG files either — `.gitattributes` ensures git always keeps the current branch's version automatically.

The VRT diff report artifact on the feature branch (available in the CI run for the PR) shows what changed visually and serves as the review record for the merge.


## Completing GitHub Issues

After finishing work on a GitHub issue:

1. Commit all changes with a message referencing the issue (e.g. `Resolves #4`)
2. Push the branch to origin
3. Create a pull request using the GitHub MCP tools targeting `main` with:
   - A clear title summarizing the change
   - A body that includes `Closes #<issue-number>` so GitHub auto-closes the issue on merge
