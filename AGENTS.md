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
9. Open a pull request.
