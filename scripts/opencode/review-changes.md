# Review Changes

You are an automated agent reviewing code changes after execution. Follow these steps precisely.

## Step 1: Determine Active Phase

Read `context/ACTIVE_PHASE.md` first:
- Extract the phase name from the code block (e.g., `v2-static-forms`)
- This determines which PROGRESS.md to reference

## Step 2: Read Context

Read these files (using the active phase):
- `AGENTS.md` - Workflow rules
- `context/{phase}/PROGRESS.md` - Find the completed task

Example: If active phase is `v2-static-forms`:
- Read `context/v2-static-forms/PROGRESS.md`

## Step 3: Identify What Was Done

From PROGRESS.md, find the task marked `🔄 In Progress` (just finished).
Read the linked plan file from `.cursor/plans/`.

## Step 4: Check Git Status

Run:
```bash
git status
git diff --stat
```

List all modified, added, and deleted files.

## Step 5: Review Each Changed File

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

## Step 6: Verify Tests

Run:
```bash
pnpm test
```

Check:
- New functionality has tests
- Tests cover happy path AND edge cases
- Tests cover error scenarios
- Test descriptions are clear

## Step 7: Run Full Quality Checks

Run:
```bash
pnpm run check
```

**All checks MUST pass.**

If any fail:
- Fix the issues
- Re-run checks
- Continue until all pass

## Step 8: Verify Deliverables

1. **Check the plan file** (`.cursor/plans/task_{TASK_ID}_*.plan.md`):
   - All deliverables should be checked: `[x]`
   - If any are `[ ]`, either complete them or check them off if done

2. **Cross-reference with `context/{phase}/PROGRESS.md`** task deliverables:
   - All deliverables must be complete
   - Check them off if not already done

## Step 9: Check for Unintended Changes

Look for:
- Files changed outside the plan scope
- Changes to unrelated functionality
- Unexpected config file changes

If unintended changes exist, revert them if not needed.

## Step 10: Update PROGRESS.md

After all checks pass:
1. Update `context/{phase}/PROGRESS.md`:
   - Update task status to `✅ Complete`
   - Check off all deliverables
   - Add notes about implementation
   - Add Change Log entry

## Step 11: Output Result

If everything passes:
```
REVIEW_COMPLETE: Task {TASK_ID}
PHASE: {active_phase}
STATUS: Ready to commit
TESTS: {number} passing
FILES: {count} files changed
```

If issues remain:
```
REVIEW_FAILED: {reason}
PHASE: {active_phase}
ISSUES: {list of issues}
```

## Rules
- DO read ACTIVE_PHASE.md first
- DO fix any issues found
- DO run quality checks until passing
- DO update the correct phase's PROGRESS.md on success
- DO NOT commit (next step does that)
- DO NOT wait for approval
- DO output REVIEW_COMPLETE or REVIEW_FAILED
