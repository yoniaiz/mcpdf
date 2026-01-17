# Prepare Plan for Task

You are an automated agent preparing a plan for a coding task. Follow these steps precisely.

## Step 1: Read Context Files

Read these files to understand the project:
- `AGENTS.md` - Workflow rules
- `context/PROGRESS.md` - Task status tracker  
- `context/PRD.md` - Product requirements

## Step 2: Identify the Target Task

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

## Step 3: Check Existing Plans

Look in `.cursor/plans/` for any plans matching `task_{TASK_ID}_*.plan.md`.
If found, read them to understand previous work.

## Step 4: Analyze Current Codebase

Based on deliverables, explore relevant code:
- Read similar existing implementations
- Understand patterns and conventions
- Identify where new code should go

## Step 5: Read Technical Resources

For local documentation, check:
- `context/resources/LIBRARIES.md`
- `context/resources/MCP_EXAMPLES.md`
- `context/resources/PDF_PATTERNS.md`

## Step 6: Create the Plan File

**IMPORTANT:** You must create the plan file yourself.

Create a file at `.cursor/plans/task_{TASK_ID}_{task_name_snake_case}_{random_8_chars}.plan.md`

Use this format:

```markdown
# Plan: Task {TASK_ID} - {Task Name}

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
```

## Rules
- DO create the plan file yourself
- DO NOT implement any code
- DO NOT wait for approval
- DO output the plan file path at the end
