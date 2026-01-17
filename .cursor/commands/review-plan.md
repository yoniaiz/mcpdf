# Review Plan - Validate Before Execution

## Overview
This command reviews an existing plan before execution to ensure completeness, 
correctness, and alignment with requirements. Run this after `prepare-plan` 
creates a plan and before `execute-plan`.

**Purpose:** Catch issues before implementation, not during or after.

---

## Step 1: Read Core Context

Read these files in parallel:
- `AGENTS.md` - Workflow rules and conventions
- `context/PROGRESS.md` - Current task status
- `context/PRD.md` - Product requirements

---

## Step 2: Identify the Task and Plan

From PROGRESS.md:
1. Find the task that is `⏳ Pending` (next to execute) or `🔄 In Progress`
2. Extract the **Task ID** (e.g., "Task 2.4")

Find the plan file:
- Look in `.cursor/plans/` for files matching `task_X.Y_*.plan.md`
- If multiple plans exist, use the most recent one
- If NO plan exists, STOP: "No plan found for Task X.Y. Run prepare-plan first."

---

## Step 3: Read the Plan Thoroughly

Read the entire plan file and extract:
- The stated approach/architecture
- All implementation steps
- Test coverage planned
- Files to be created/modified
- Dependencies and assumptions

---

## Step 4: Validate Against PRD

Compare the plan against `context/PRD.md`:

**Check these items:**
- [ ] Does the plan cover ALL deliverables listed in PROGRESS.md for this task?
- [ ] Does the approach align with the PRD's technical requirements?
- [ ] Are edge cases mentioned in PRD addressed?
- [ ] Are error handling requirements covered?
- [ ] Is the scope appropriate (not too narrow, not too broad)?

---

## Step 5: Validate Against Codebase

Explore the current codebase to verify:

**Check these items:**
- [ ] Do the files mentioned in the plan actually exist where expected?
- [ ] Are the patterns/conventions in the plan consistent with existing code?
- [ ] Are there existing utilities/helpers the plan should use but doesn't mention?
- [ ] Will the planned changes integrate smoothly with existing code?
- [ ] Are import paths and module structures correct?

---

## Step 6: Check for Missing Elements

**Common things plans miss:**

1. **Tests**
   - [ ] Unit tests for new functions/methods?
   - [ ] Edge case tests?
   - [ ] Error handling tests?
   - [ ] Integration tests if needed?

2. **Error Handling**
   - [ ] What happens when inputs are invalid?
   - [ ] What happens when external operations fail?
   - [ ] Are errors properly typed and propagated?

3. **Documentation**
   - [ ] JSDoc comments for public APIs?
   - [ ] Type definitions exported if needed?

4. **Edge Cases**
   - [ ] Empty inputs?
   - [ ] Large inputs?
   - [ ] Concurrent access?
   - [ ] Unicode/special characters?

5. **Dependencies**
   - [ ] Any new packages needed?
   - [ ] Version compatibility?

---

## Step 7: Assess Implementation Order

**Check the sequencing:**
- [ ] Are steps in a logical order?
- [ ] Are dependencies implemented before dependents?
- [ ] Can some steps be parallelized?
- [ ] Is the order testable at each step?

---

## Step 8: Generate Review Report

Produce a structured report:

```markdown
# Plan Review: Task X.Y - [Task Name]

## Plan File
`.cursor/plans/task_X.Y_name.plan.md`

## ✅ Validated Items
- [List things that look correct]
- [List things that look correct]

## ⚠️ Concerns / Suggestions
### [Concern 1 Title]
**Issue:** [Description of the concern]
**Suggestion:** [How to address it]

### [Concern 2 Title]
**Issue:** [Description of the concern]  
**Suggestion:** [How to address it]

## ❌ Missing Elements
- [ ] [Missing item 1]
- [ ] [Missing item 2]

## 📋 Deliverable Coverage
| Deliverable | Covered in Plan? | Notes |
|-------------|------------------|-------|
| [Deliverable 1] | ✅ Yes / ❌ No | [notes] |
| [Deliverable 2] | ✅ Yes / ❌ No | [notes] |

## 🔧 Recommended Plan Updates
1. [Specific update 1]
2. [Specific update 2]

## Overall Assessment
- **Ready for execution:** ✅ Yes / ⚠️ With changes / ❌ No
- **Risk level:** Low / Medium / High
- **Estimated complexity:** [assessment]
```

---

## Step 9: Provide Recommendation

End with one of these recommendations:

### If plan is ready:
```
---
✅ **Plan Review Complete: Task X.Y - [Task Name]**

The plan is **ready for execution**. No significant issues found.

You can now run `execute-plan` to implement this task.
```

### If plan needs minor updates:
```
---
⚠️ **Plan Review Complete: Task X.Y - [Task Name]**

The plan needs **minor updates** before execution:
1. [Update 1]
2. [Update 2]

Please update the plan, then run `execute-plan`.
```

### If plan has significant issues:
```
---
❌ **Plan Review Complete: Task X.Y - [Task Name]**

The plan has **significant issues** that should be addressed:
1. [Issue 1]
2. [Issue 2]

Consider re-running `prepare-plan` with additional context, or manually update the plan.
```

---

## DO NOT
- ❌ Execute the plan (that's for `execute-plan`)
- ❌ Make code changes
- ❌ Skip validation steps
- ❌ Approve plans that miss deliverables
- ❌ Ignore existing codebase patterns
- ❌ Rush through the review
