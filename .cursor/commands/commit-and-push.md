# Commit and Push - Finalize Changes

## Overview
This command stages, commits, and pushes approved changes to the repository.
Run this after `review-changes` confirms everything is ready.

**Prerequisites:** 
- `execute-plan` completed successfully
- `review-changes` approved the changes
- All quality checks pass

---

## Step 1: Verify Prerequisites

### Check quality gates passed:
```bash
pnpm run check
```

**STOP if any check fails.** Run `review-changes` to identify issues.

### Check git status:
```bash
git status
```

Verify there are changes to commit.

---

## Step 2: Read Context for Commit Message

Read these files:
- `context/PROGRESS.md` - Get the task that was completed
- The linked plan file from `.cursor/plans/`

Extract:
- Task ID and name
- Key deliverables completed
- Any important notes

---

## Step 3: Review Changes One More Time

Show a summary of what will be committed:

```bash
git diff --stat
```

Confirm these are the expected files.

---

## Step 4: Stage Changes

Stage all changes related to the task:

```bash
git add -A
```

Or selectively stage if there are unrelated changes:
```bash
git add src/
git add tests/
git add context/PROGRESS.md
# etc.
```

**Verify staged changes:**
```bash
git diff --cached --stat
```

---

## Step 5: Create Commit Message

**Format:**
```
feat(scope): Brief description of what was done

Task X.Y: [Task Name]

- [Deliverable 1 completed]
- [Deliverable 2 completed]
- [Any notable implementation details]

Plan: .cursor/plans/task_X.Y_name.plan.md
```

**Commit types:**
- `feat` - New feature
- `fix` - Bug fix  
- `refactor` - Code refactoring
- `test` - Adding/updating tests
- `docs` - Documentation changes
- `chore` - Maintenance tasks

**Scope examples:** `pdf`, `mcp`, `tools`, `server`, `core`

---

## Step 6: Commit

```bash
git commit -m "feat(scope): Brief description

Task X.Y: Task Name

- Deliverable 1
- Deliverable 2

Plan: .cursor/plans/task_X.Y_name.plan.md"
```

---

## Step 7: Push to Remote

```bash
git push origin main
```

Or if on a feature branch:
```bash
git push origin feature/task-X.Y-name
```

If push fails due to remote changes:
```bash
git pull --rebase origin main
git push origin main
```

---

## Step 8: Verify Push

Confirm the push succeeded:
```bash
git log --oneline -1
```

Check remote status:
```bash
git status
```

Should show "Your branch is up to date with 'origin/main'."

---

## Step 9: Update PROGRESS.md (if not done)

Ensure PROGRESS.md reflects the completion:
- Task status is `✅ Complete`
- All deliverables are checked off
- Change log entry exists for today

---

## Step 10: Final Report

```markdown
# Commit Complete: Task X.Y - [Task Name]

## Commit Details
- **Commit hash:** [abc1234]
- **Branch:** main
- **Message:** feat(scope): [description]

## Files Committed
- X files changed
- +Y insertions, -Z deletions

## Changes Pushed
✅ Successfully pushed to origin/main

## Task Status
- Task X.Y marked complete in PROGRESS.md
- Change log updated

---
```

End with:
```
---
✅ **Task X.Y: [Task Name] committed and pushed successfully!**

Commit: [hash]
Branch: main

**Next steps:**
- Review PROGRESS.md for the next pending task
- Run `prepare-plan` when ready to start the next task
```

---

## Handling Common Issues

### Merge Conflicts
If `git push` fails due to conflicts:
1. `git pull --rebase origin main`
2. Resolve conflicts if any
3. `git rebase --continue`
4. Run `pnpm run check` again
5. `git push origin main`

### Wrong Files Staged
If you staged files that shouldn't be committed:
```bash
git reset HEAD path/to/file
```

### Need to Amend Commit
If you need to fix the commit before pushing:
```bash
git commit --amend
```

### Push Rejected (Protected Branch)
If pushing to a protected branch:
1. Create a feature branch: `git checkout -b feature/task-X.Y`
2. Push the branch: `git push origin feature/task-X.Y`
3. Create a pull request

---

## DO NOT
- ❌ Commit without passing quality checks
- ❌ Commit without review-changes approval
- ❌ Use vague commit messages ("fixed stuff", "updates")
- ❌ Commit unrelated changes in the same commit
- ❌ Force push to main branch
- ❌ Skip the push step
- ❌ Commit sensitive data (secrets, API keys)
