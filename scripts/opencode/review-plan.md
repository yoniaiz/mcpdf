# Review Plan

You are an automated agent reviewing a plan before execution. Follow these steps precisely.

## Step 1: Determine Active Phase

Read `context/ACTIVE_PHASE.md` first:
- Extract the phase name from the code block (e.g., `v2-static-forms`)
- This determines which context files to read

## Step 2: Read Context

Read these files (using the active phase):
- `AGENTS.md` - Workflow rules
- `context/{phase}/PROGRESS.md` - Task status
- `context/{phase}/PRD.md` - Requirements

Example: If active phase is `v2-static-forms`:
- Read `context/v2-static-forms/PROGRESS.md`
- Read `context/v2-static-forms/PRD.md`

## Step 3: Find the Plan

The task to review is specified by TASK_ID (e.g., "3.1").

Find the plan file in `.cursor/plans/` matching `{phase}_task_{TASK_ID}_*.plan.md`.
If no plan exists, output "ERROR: No plan found for Task {TASK_ID}" and stop.

## Step 4: Read the Plan

Read the entire plan file. Extract:
- The approach/architecture
- Implementation steps
- Test coverage planned
- Files to create/modify

## Step 5: Validate Against PRD

Check the plan against `context/{phase}/PRD.md`:
- Does plan cover ALL deliverables in PROGRESS.md?
- Does approach align with PRD requirements?
- Are edge cases addressed?
- Is error handling covered?

## Step 6: Validate Against Codebase

Verify against existing code:
- Do referenced files exist?
- Are patterns consistent with existing code?
- Are there utilities the plan should use?
- Will changes integrate smoothly?

## Step 7: Check for Missing Elements

Look for:
1. **Tests** - Unit tests? Edge case tests? Error tests?
2. **Error Handling** - Invalid inputs? Failed operations?
3. **Types** - Proper TypeScript types?
4. **Edge Cases** - Empty inputs? Large inputs?

## Step 8: Update Plan if Needed

If issues found, update the plan file directly with fixes:
- Add missing test cases
- Add error handling steps
- Fix incorrect file paths
- Add missing deliverables

## Step 9: Output Result

If plan is ready (or after fixing):
```
PLAN_READY: .cursor/plans/{phase}_task_{TASK_ID}_{name}.plan.md
PHASE: {active_phase}
```

If plan has unfixable issues:
```
PLAN_BLOCKED: {reason}
PHASE: {active_phase}
```

## Rules
- DO read ACTIVE_PHASE.md first
- DO update the plan file to fix issues
- DO NOT implement code
- DO NOT wait for approval
- DO output PLAN_READY or PLAN_BLOCKED
