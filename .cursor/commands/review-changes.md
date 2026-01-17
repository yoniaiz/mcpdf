# Review Changes - Post-Implementation Verification

## Overview
This command reviews changes after plan execution to ensure quality, 
completeness, and correctness before committing. Run this after `execute-plan` 
completes and before `commit-and-push`.

**Purpose:** Final quality gate before code is committed.

---

## Step 1: Read Context

Read these files:
- `AGENTS.md` - Workflow rules
- `context/PROGRESS.md` - Find the task that was just completed

---

## Step 2: Identify What Was Done

From PROGRESS.md:
1. Find the task marked `✅ Complete` or `🔄 In Progress` (just finished)
2. Read the linked plan file from `.cursor/plans/`
3. Note the deliverables and expected changes

---

## Step 3: Check Git Status

Run these commands to understand what changed:

```bash
git status
```

```bash
git diff --stat
```

List all modified, added, and deleted files.

---

## Step 4: Review Each Changed File

For each modified/added file, review:

**Code Quality:**
- [ ] Code follows project conventions and patterns
- [ ] No debug statements left behind (console.log, debugger, etc.)
- [ ] No commented-out code that should be removed
- [ ] No TODO comments that should be addressed now
- [ ] Proper TypeScript types (no `any` unless justified)

**Correctness:**
- [ ] Logic implements what the plan specified
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No obvious bugs or typos

**Style:**
- [ ] Consistent naming conventions
- [ ] Proper indentation and formatting
- [ ] Appropriate comments (not too few, not too many)

---

## Step 5: Verify Test Coverage

**Check tests exist and pass:**

```bash
pnpm test
```

**Verify test quality:**
- [ ] New functionality has corresponding tests
- [ ] Tests cover happy path AND edge cases
- [ ] Tests cover error scenarios
- [ ] Test descriptions are clear and meaningful
- [ ] No skipped tests (`.skip`) without explanation

---

## Step 6: Run Full Quality Checks

**Run the complete check suite:**

```bash
pnpm run check
```

This should run:
- ESLint (linting)
- TypeScript (type checking)
- Vitest (tests)

**All checks MUST pass.**

If any fail:
1. Document what failed
2. These must be fixed before proceeding

---

## Step 7: Verify Deliverables

Cross-reference with PROGRESS.md task deliverables:

| Deliverable | Status | Evidence |
|-------------|--------|----------|
| [Deliverable 1] | ✅/❌ | [File/test that proves it] |
| [Deliverable 2] | ✅/❌ | [File/test that proves it] |

**All deliverables must be complete.**

---

## Step 8: Check for Unintended Changes

Look for:
- [ ] Files changed that weren't part of the plan
- [ ] Changes to unrelated functionality
- [ ] Modified config files (intentional?)
- [ ] Changes to dependencies (package.json)

**If unintended changes exist, document and assess if they should be reverted.**

---

## Step 9: Manual Testing (if applicable)

For user-facing features:
- [ ] Test the feature manually
- [ ] Verify it works as expected
- [ ] Check edge cases work

For MCP tools:
```bash
pnpm run build && pnpm run inspect
```
- [ ] Tool appears in MCP Inspector
- [ ] Tool accepts correct inputs
- [ ] Tool produces expected outputs

---

## Step 10: Generate Review Report

```markdown
# Change Review: Task X.Y - [Task Name]

## Summary
- **Task:** Task X.Y - [Name]
- **Plan:** `.cursor/plans/task_X.Y_name.plan.md`
- **Files changed:** X files (+Y/-Z lines)

## Quality Checks
| Check | Status |
|-------|--------|
| Lint | ✅ Pass / ❌ Fail |
| TypeScript | ✅ Pass / ❌ Fail |
| Tests | ✅ Pass (X tests) / ❌ Fail |
| Build | ✅ Pass / ❌ Fail |

## Deliverable Verification
| Deliverable | Complete | Evidence |
|-------------|----------|----------|
| [Deliverable 1] | ✅/❌ | [evidence] |
| [Deliverable 2] | ✅/❌ | [evidence] |

## Code Review Findings

### ✅ Good
- [Positive finding 1]
- [Positive finding 2]

### ⚠️ Minor Issues (optional to fix)
- [Minor issue 1]
- [Minor issue 2]

### ❌ Must Fix Before Commit
- [Critical issue 1]
- [Critical issue 2]

## Files Changed
| File | Change Type | Summary |
|------|-------------|---------|
| `path/file1.ts` | Modified | [what changed] |
| `path/file2.ts` | Added | [new file purpose] |

## Test Coverage
- New tests added: X
- Tests passing: Y/Y
- Coverage areas: [list what's tested]

## Manual Testing
- [ ] Tested manually: [results]
```

---

## Step 11: Provide Recommendation

### If ready to commit:
```
---
✅ **Change Review Complete: Task X.Y - [Task Name]**

All checks pass. Changes are **ready to commit**.

Summary:
- X files changed
- Y tests passing
- All deliverables verified

You can now run `commit-and-push` to finalize these changes.
```

### If fixes needed:
```
---
⚠️ **Change Review Complete: Task X.Y - [Task Name]**

**Issues found that must be fixed:**
1. [Issue 1]
2. [Issue 2]

Please fix these issues, then run `review-changes` again.
```

### If significant problems:
```
---
❌ **Change Review Complete: Task X.Y - [Task Name]**

**Significant problems found:**
1. [Problem 1]
2. [Problem 2]

Consider reverting changes and re-running `execute-plan` after updating the plan.
```

---

## DO NOT
- ❌ Commit changes (that's for `commit-and-push`)
- ❌ Skip quality checks
- ❌ Approve incomplete deliverables
- ❌ Ignore failing tests
- ❌ Rush through code review
- ❌ Skip manual testing for user-facing features
