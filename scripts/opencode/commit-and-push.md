# Commit and Push

You are an automated agent committing and pushing completed changes. Follow these steps precisely.

## Step 1: Determine Active Phase

Read `context/ACTIVE_PHASE.md` first:
- Extract the phase name from the code block (e.g., `v2-static-forms`)
- This determines which PROGRESS.md to reference

## Step 2: Verify Prerequisites

Run quality checks one final time:
```bash
pnpm run check
```

**STOP if any check fails.** Output "COMMIT_BLOCKED: Quality checks failed" and stop.

Check git status:
```bash
git status
```

Verify there are changes to commit.

## Step 3: Read Context

Read `context/{phase}/PROGRESS.md` to get:
- Task ID and name that was completed
- Key deliverables
- Any implementation notes

## Step 4: Review Changes

Show what will be committed:
```bash
git diff --stat
```

Confirm these are the expected files.

## Step 5: Stage Changes

Stage all task-related changes:
```bash
git add -A
```

Verify staged changes:
```bash
git diff --cached --stat
```

## Step 6: Create Commit Message

Format:
```
feat(scope): Brief description

[Phase: {phase}] Task X.Y: Task Name

- Deliverable 1 completed
- Deliverable 2 completed

Plan: .cursor/plans/task_X.Y_name.plan.md
```

Commit types:
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code refactoring
- `test` - Adding tests
- `docs` - Documentation
- `chore` - Maintenance

Scope examples: `pdf`, `mcp`, `tools`, `server`, `static-forms`

## Step 7: Commit

Run the commit:
```bash
git commit -m "feat(scope): description

[Phase: {phase}] Task X.Y: Task Name

- Deliverable 1
- Deliverable 2

Plan: .cursor/plans/task_X.Y_name.plan.md"
```

## Step 8: Push to Remote

```bash
git push origin main
```

If push fails due to remote changes:
```bash
git pull --rebase origin main
pnpm run check  # Re-verify after rebase
git push origin main
```

## Step 9: Verify Push

Confirm:
```bash
git log --oneline -1
git status
```

Should show "Your branch is up to date with 'origin/main'."

## Step 10: Output Result

If successful:
```
COMMIT_COMPLETE: Task {TASK_ID}
PHASE: {active_phase}
COMMIT_HASH: {hash}
BRANCH: main
FILES_COMMITTED: {count}
```

If failed:
```
COMMIT_FAILED: {reason}
PHASE: {active_phase}
```

## Rules
- DO read ACTIVE_PHASE.md first
- DO verify quality checks pass first
- DO use conventional commit format with phase prefix
- DO push to remote
- DO NOT commit with failing checks
- DO NOT force push
- DO output COMMIT_COMPLETE or COMMIT_FAILED
