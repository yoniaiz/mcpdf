# Execute Plan - Implement and Complete Task

## Overview
This command executes an existing plan created in Cursor Plan Mode.
You will implement the plan, run quality checks, and update task status.

**Prerequisites:** A plan must exist for the task you're executing.

---

## Step 1: Read Core Context

Read these files:
- `AGENTS.md` - Workflow rules (especially quality gates)
- `context/PROGRESS.md` - Find the current task being worked on

---

## Step 2: Identify the Task and Plan

From PROGRESS.md, identify:
1. The task that is `🔄 In Progress` OR the first `⏳ Pending` task
2. Extract the **Task ID** (e.g., "Task 2.4")

Find the plan file:
- Look in `.cursor/plans/` for files matching `task_X.Y_*.plan.md`
- If multiple plans exist for the same task, use the most recent one
- If NO plan exists, STOP and report: "No plan found for Task X.Y. Run prepare-plan first."

---

## Step 3: Mark Task In Progress

Update PROGRESS.md:
- Change task status from `⏳ Pending` to `🔄 In Progress`
- This signals the task is being actively worked on

---

## Step 4: Read and Understand the Plan

Read the plan file completely. Understand:
- The approach and architecture decisions
- The sequence of implementation steps
- Any specific patterns or conventions to follow
- Expected file changes

---

## Step 5: Execute the Plan

Implement the plan step by step:
1. Work through each step in order
2. Follow the patterns and approaches defined in the plan
3. Write tests as specified
4. Keep changes focused on the plan scope

**During implementation:**
- If you encounter an issue not covered by the plan, note it
- If you need to deviate from the plan, document why
- Commit to the plan's approach unless it's clearly wrong

---

## Step 6: Run Quality Checks

**REQUIRED before marking complete:**

```bash
pnpm run check
```

This runs: lint, typecheck, and tests.

If any check fails:
1. Fix the issues
2. Re-run `pnpm run check`
3. Repeat until all checks pass

**All checks MUST pass before proceeding.**

---

## Step 7: Prepare Completion Report

Create a summary of what was done:

```markdown
## Task X.Y: [Task Name] - COMPLETE ✅

### What was done:
- [Implementation summary 1]
- [Implementation summary 2]
- ...

### Quality checks:
- ✅ Lint: passed
- ✅ Typecheck: passed  
- ✅ Tests: passed (X tests)

### Plan followed:
- Plan file: `.cursor/plans/task_X.Y_name.plan.md`
- [Note any deviations and why]

### Files created/modified:
- `path/to/file1.ts` - [what changed]
- `path/to/file2.ts` - [what changed]

### Deliverables completed:
- [x] Deliverable 1
- [x] Deliverable 2
- ...
```

---

## Step 8: Request Approval

Present the completion report and ask:

```
---
**Task X.Y: [Task Name] is ready for review.**

All quality checks pass. Please review the changes above.

**Should I mark this task as complete and update PROGRESS.md?**
```

**WAIT for user approval before proceeding.**

---

## Step 9: Update PROGRESS.md (after approval)

Only after user approves:

1. Update task status to `✅ Complete`
2. Check off all completed deliverables
3. Add notes about implementation decisions
4. Link the plan file used
5. Add entry to the Change Log

Example update:
```markdown
### Task X.Y: Task Name
- **Status:** ✅ Complete
- **Plan:** [`.cursor/plans/task_X.Y_name.plan.md`](.cursor/plans/task_X.Y_name.plan.md)
- **Deliverables:**
  - [x] First deliverable
  - [x] Second deliverable
- **Notes:** [Any implementation notes or deviations]
```

Change Log entry:
```markdown
| YYYY-MM-DD | Task X.Y | Brief description of what was completed |
```

---

## Final Output

After updating PROGRESS.md:

```
---
✅ **Task X.Y: [Task Name] marked as complete.**

PROGRESS.md has been updated with:
- Status: ✅ Complete
- All deliverables checked off
- Change log entry added

**Next pending task:** Task X.Z: [Next Task Name]
```

---

## DO NOT
- ❌ Execute without a plan file
- ❌ Skip quality checks (`pnpm run check`)
- ❌ Mark complete before checks pass
- ❌ Mark complete without user approval
- ❌ Deviate significantly from the plan without documenting why
- ❌ Work on tasks out of order
