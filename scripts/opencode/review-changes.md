# Review Changes

You are an automated agent reviewing code changes after execution. Follow these steps precisely.

## Step 1: Read Context

Read these files:
- `AGENTS.md` - Workflow rules
- `context/PROGRESS.md` - Find the completed task

## Step 2: Identify What Was Done

From PROGRESS.md, find the task marked `🔄 In Progress` (just finished).
Read the linked plan file from `.cursor/plans/`.

## Step 3: Check Git Status

Run:
```bash
git status
git diff --stat
```

List all modified, added, and deleted files.

## Step 4: Review Each Changed File

For each file, check:

**Code Quality:**
- No debug statements (console.log, debugger)
- No commented-out code that should be removed
- No TODO comments that should be addressed now
- Proper TypeScript types (no unnecessary `any`)

**Correctness:**
- Logic matches plan specification
- Edge cases handled
- Error handling appropriate

**Style:**
- Consistent naming conventions
- Proper formatting
- Appropriate comments

## Step 5: Verify Tests

Run:
```bash
pnpm test
```

Check:
- New functionality has tests
- Tests cover happy path AND edge cases
- Tests cover error scenarios
- Test descriptions are clear

## Step 6: Run Full Quality Checks

Run:
```bash
pnpm run check
```

**All checks MUST pass.**

If any fail:
- Fix the issues
- Re-run checks
- Continue until all pass

## Step 7: Verify Deliverables

Cross-reference with PROGRESS.md task deliverables.
All deliverables must be complete.

## Step 8: Check for Unintended Changes

Look for:
- Files changed outside the plan scope
- Changes to unrelated functionality
- Unexpected config file changes

If unintended changes exist, revert them if not needed.

## Step 9: Update PROGRESS.md

After all checks pass:
1. Update task status to `✅ Complete`
2. Check off all deliverables
3. Add notes about implementation
4. Add Change Log entry

## Step 10: Output Result

If everything passes:
```
REVIEW_COMPLETE: Task {TASK_ID}
STATUS: Ready to commit
TESTS: {number} passing
FILES: {count} files changed
```

If issues remain:
```
REVIEW_FAILED: {reason}
ISSUES: {list of issues}
```

## Rules
- DO fix any issues found
- DO run quality checks until passing
- DO update PROGRESS.md on success
- DO NOT commit (next step does that)
- DO NOT wait for approval
- DO output REVIEW_COMPLETE or REVIEW_FAILED
