# Prepare Plan for Task

You are an automated agent preparing a plan for a coding task. Follow these steps precisely.

## Step 1: Determine Active Phase

Read `context/ACTIVE_PHASE.md` first:
- Extract the phase name from the code block (e.g., `v2-static-forms`)
- This determines which context files to read

## Step 2: Read Context Files

Read these files to understand the project (using the active phase):
- `AGENTS.md` - Workflow rules
- `context/{phase}/PROGRESS.md` - Task status tracker  
- `context/{phase}/PRD.md` - Product requirements

Example: If active phase is `v2-static-forms`:
- Read `context/v2-static-forms/PROGRESS.md`
- Read `context/v2-static-forms/PRD.md`

## Step 3: Identify the Target Task

The task to work on is specified by the environment variable TASK_ID (e.g., "3.1").

From PROGRESS.md:
1. Find the task matching "Task {TASK_ID}"
2. Verify dependencies are complete (✅)
3. If dependencies incomplete, output "BLOCKED: Dependencies not complete" and stop

Extract:
- Task ID
- Task name
- All deliverables
- Any notes or constraints

## Step 4: Check Existing Plans

Look in `.cursor/plans/` for any plans matching `task_{TASK_ID}_*.plan.md`.
If found, read them to understand previous work.

## Step 5: Analyze Current Codebase

Based on deliverables, explore relevant code:
- Read similar existing implementations
- Understand patterns and conventions
- Identify where new code should go

## Step 6: Read Technical Resources

For local documentation, check:

**Shared resources:**
- `context/resources/LIBRARIES.md`
- `context/resources/MCP_EXAMPLES.md`

**Phase-specific resources** (based on active phase):
- `context/{phase}/resources/*`

Example for `v2-static-forms`:
- `context/v2-static-forms/resources/STATIC_FORM_RESEARCH.md`

## Step 7: Create the Plan File

**IMPORTANT:** You must create the plan file yourself.

Create a file at `.cursor/plans/task_{TASK_ID}_{task_name_snake_case}_{random_8_chars}.plan.md`

Use this format:

```markdown
# Plan: Task {TASK_ID} - {Task Name}

## Context
- **Active Phase:** {phase}
- **PRD:** `context/{phase}/PRD.md`
- **PROGRESS:** `context/{phase}/PROGRESS.md`

## Overview
Brief description of what this task accomplishes.

## Dependencies
- List of prerequisite tasks (should all be ✅ Complete)

## Deliverables
1. [ ] First deliverable
2. [ ] Second deliverable
...

## Implementation Steps

### Step 1: {Step Title}
**Files:** `path/to/file.ts`
**Changes:**
- Specific change 1
- Specific change 2

### Step 2: {Step Title}
...

### Step N: Write Tests
**Files:** `tests/path/to/file.test.ts`
**Test cases:**
- Test case 1
- Test case 2
- Edge cases

## Files to Create/Modify
- `src/path/file.ts` - Description
- `tests/path/file.test.ts` - Description

## Quality Checklist
- [ ] All deliverables addressed
- [ ] Tests cover happy path and edge cases
- [ ] Error handling implemented
- [ ] Follows existing patterns
```

## Step 8: Output Completion

After creating the plan file, output:

```
PLAN_CREATED: .cursor/plans/task_{TASK_ID}_{name}.plan.md
PHASE: {active_phase}
```

## Rules
- DO read ACTIVE_PHASE.md first
- DO create the plan file yourself
- DO NOT implement any code
- DO NOT wait for approval
- DO output the plan file path at the end
