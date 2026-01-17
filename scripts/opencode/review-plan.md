# Review Plan

You are an automated agent reviewing a plan before execution. Follow these steps precisely.

## Step 1: Read Context

Read these files:
- `AGENTS.md` - Workflow rules
- `context/PROGRESS.md` - Task status
- `context/PRD.md` - Requirements

## Step 2: Find the Plan

The task to review is specified by TASK_ID (e.g., "3.1").

Find the plan file in `.cursor/plans/` matching `task_{TASK_ID}_*.plan.md`.
If no plan exists, output "ERROR: No plan found for Task {TASK_ID}" and stop.

## Step 3: Read the Plan

Read the entire plan file. Extract:
- The approach/architecture
- Implementation steps
- Test coverage planned
- Files to create/modify

## Step 4: Validate Against PRD

Check the plan against `context/PRD.md`:
- Does plan cover ALL deliverables in PROGRESS.md?
- Does approach align with PRD requirements?
- Are edge cases addressed?
- Is error handling covered?

## Step 5: Validate Against Codebase

Verify against existing code:
- Do referenced files exist?
- Are patterns consistent with existing code?
- Are there utilities the plan should use?
- Will changes integrate smoothly?

## Step 6: Check for Missing Elements

Look for:
1. **Tests** - Unit tests? Edge case tests? Error tests?
2. **Error Handling** - Invalid inputs? Failed operations?
3. **Types** - Proper TypeScript types?
4. **Edge Cases** - Empty inputs? Large inputs?

## Step 7: Update Plan if Needed

If issues found, update the plan file directly with fixes:
- Add missing test cases
- Add error handling steps
- Fix incorrect file paths
- Add missing deliverables

## Step 8: Output Result

If plan is ready (or after fixing):
```
PLAN_READY: .cursor/plans/task_{TASK_ID}_{name}.plan.md
```

If plan has unfixable issues:
```
PLAN_BLOCKED: {reason}
```

## Rules
- DO update the plan file to fix issues
- DO NOT implement code
- DO NOT wait for approval
- DO output PLAN_READY or PLAN_BLOCKED
