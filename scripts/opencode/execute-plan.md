# Execute Plan

You are an automated agent executing a coding plan. Follow these steps precisely.

## Step 1: Determine Active Phase

Read `context/ACTIVE_PHASE.md` first:
- Extract the phase name from the code block (e.g., `v2-static-forms`)
- This determines which PROGRESS.md to read and update

## Step 2: Read Context

Read these files (using the active phase):
- `AGENTS.md` - Workflow rules (especially quality gates)
- `context/{phase}/PROGRESS.md` - Current task status

Example: If active phase is `v2-static-forms`:
- Read `context/v2-static-forms/PROGRESS.md`

## Step 3: Find and Read the Plan

The task is specified by TASK_ID (e.g., "3.1").

Find the plan file in `.cursor/plans/` matching `task_{TASK_ID}_*.plan.md`.
Read it completely. Understand:
- The approach and architecture
- Implementation steps sequence
- Expected file changes

## Step 4: Mark Task In Progress

Update `context/{phase}/PROGRESS.md`:
- Change task status from `⏳ Pending` to `🔄 In Progress`

## Step 5: Execute the Plan

Implement the plan step by step:
1. Work through each step in order
2. Follow patterns defined in the plan
3. Write tests as specified
4. Keep changes focused on plan scope
5. **After completing each step, update the plan file:**
   - Change `[ ]` to `[x]` for completed deliverables
   - Add any notes about deviations or decisions

**During implementation:**
- If you encounter issues not in the plan, document and work around
- Commit to the plan's approach unless clearly wrong

## Step 6: Update Plan and PROGRESS.md

After completing all implementation:

1. **Update the plan file:**
   - Check off all completed deliverables: `[ ]` → `[x]`
   - Add implementation notes at the bottom

2. **Update `context/{phase}/PROGRESS.md`:**
   - Check off completed deliverables in the task section
   - Keep status as `🔄 In Progress` (review step will mark complete)

## Step 7: Run Quality Checks

After implementation, run:
```bash
pnpm run check
```

This runs: lint, typecheck, and tests.

**If checks fail:**
- Fix the issues
- Re-run `pnpm run check`
- Repeat until passing

**IMPORTANT:** Quality checks MUST pass before proceeding.

## Step 8: Output Result

If all checks pass:
```
EXECUTION_COMPLETE: Task {TASK_ID}
PHASE: {active_phase}
TESTS_PASSING: {number} tests
FILES_CHANGED: {list of files}
```

If checks fail after multiple attempts:
```
EXECUTION_FAILED: {reason}
PHASE: {active_phase}
FAILING_CHECKS: {which checks failed}
```

## Rules
- DO read ACTIVE_PHASE.md first
- DO implement all code changes from the plan
- DO write all tests specified
- DO run `pnpm run check` and fix issues
- DO NOT skip quality checks
- DO NOT wait for approval
- DO output EXECUTION_COMPLETE or EXECUTION_FAILED
