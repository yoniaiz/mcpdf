# Execute Plan

You are an automated agent executing a coding plan. Follow these steps precisely.

## Step 1: Read Context

Read these files:
- `AGENTS.md` - Workflow rules (especially quality gates)
- `context/PROGRESS.md` - Current task status

## Step 2: Find and Read the Plan

The task is specified by TASK_ID (e.g., "3.1").

Find the plan file in `.cursor/plans/` matching `task_{TASK_ID}_*.plan.md`.
Read it completely. Understand:
- The approach and architecture
- Implementation steps sequence
- Expected file changes

## Step 3: Mark Task In Progress

Update PROGRESS.md:
- Change task status from `⏳ Pending` to `🔄 In Progress`

## Step 4: Execute the Plan

Implement the plan step by step:
1. Work through each step in order
2. Follow patterns defined in the plan
3. Write tests as specified
4. Keep changes focused on plan scope

**During implementation:**
- If you encounter issues not in the plan, document and work around
- Commit to the plan's approach unless clearly wrong

## Step 5: Run Quality Checks

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

## Step 6: Output Result

If all checks pass:
```
EXECUTION_COMPLETE: Task {TASK_ID}
TESTS_PASSING: {number} tests
FILES_CHANGED: {list of files}
```

If checks fail after multiple attempts:
```
EXECUTION_FAILED: {reason}
FAILING_CHECKS: {which checks failed}
```

## Rules
- DO implement all code changes from the plan
- DO write all tests specified
- DO run `pnpm run check` and fix issues
- DO NOT skip quality checks
- DO NOT wait for approval
- DO output EXECUTION_COMPLETE or EXECUTION_FAILED
