# Run Task Workflow

You are an orchestrator running the complete task workflow for mcpdf. Execute all 5 phases in sequence.

## Input
The user provides a task ID (e.g., "2.3" or "3.1").

## Workflow Phases

Execute these phases **in order**, waiting for each to complete before proceeding:

### Phase 1: Plan (task-planner)
Read and follow `.cursor/agents/task-planner.md`:
- Read ACTIVE_PHASE.md to determine current phase
- Read PRD and PROGRESS.md
- Analyze codebase for patterns
- Create plan file in `.cursor/plans/`

**Checkpoint:** Plan file created? → Continue. Blocked? → Stop and report.

---

### Phase 2: Review Plan (plan-reviewer)
Read and follow `.cursor/agents/plan-reviewer.md`:
- Read the plan just created
- Validate against PRD requirements
- Check for missing tests, edge cases, error handling
- Fix any issues in the plan

**Checkpoint:** Plan validated and ready? → Continue. Major issues? → Stop and report.

---

### Phase 3: Execute (task-executor)
Read and follow `.cursor/agents/task-executor.md`:
- Mark task as 🔄 In Progress
- Implement code following the plan step by step
- Write all specified tests
- Run `pnpm run check` until passing

**Checkpoint:** All checks passing? → Continue. Failing? → Fix and retry.

---

### Phase 4: Review Changes (change-reviewer)
Read and follow `.cursor/agents/change-reviewer.md`:
- Review all changed files for quality
- Verify tests are comprehensive
- Check for debug statements, TODOs, unnecessary `any`
- Update PROGRESS.md to ✅ Complete
- Add change log entry

**Checkpoint:** All quality checks pass and PROGRESS.md updated? → **STOP and ask for approval.**

---

### ⏸️ APPROVAL REQUIRED

After Phase 4 completes, **STOP** and present this summary to the user:

```
═══════════════════════════════════════════════════════════════
🔍 TASK READY FOR COMMIT - APPROVAL REQUIRED
═══════════════════════════════════════════════════════════════
Task: {task_id} - {task_name}
Phase: {active_phase}

Files changed:
  - [list changed files]

Tests: {count} passing
Lint: ✅ Passing
Build: ✅ Passing

Plan: .cursor/plans/{phase}_{plan_file}
═══════════════════════════════════════════════════════════════

Ready to commit and push to main.
Type "commit" or "yes" to proceed, or "no" to stop.
```

**DO NOT proceed to Phase 5 until the user explicitly approves.**

---

### Phase 5: Commit (task-committer) — REQUIRES APPROVAL
Read and follow `.cursor/agents/task-committer.md`:
- Run final quality check
- Stage all changes
- Create conventional commit with phase prefix
- Push to origin/main

**Checkpoint:** Committed and pushed? → Done!

---

## Status Reporting

After each phase, briefly report:
```
✅ Phase N complete: [summary]
→ Proceeding to Phase N+1...
```

If blocked:
```
❌ Phase N blocked: [reason]
Action needed: [what to do]
```

## Final Summary

After all phases complete:
```
═══════════════════════════════════════════
✅ Task {task_id} COMPLETE
═══════════════════════════════════════════
Phase: {active_phase}
Plan: .cursor/plans/{phase}_{plan_file}
Commit: {commit_hash}
Files changed: {count}
Tests: {count} passing
═══════════════════════════════════════════
```

## Rules
- Execute phases in strict order
- Do not skip phases
- Stop and report if any phase is blocked
- Read each agent file before executing that phase
- Keep the user informed of progress
- **NEVER commit without explicit user approval** (Phase 5 requires "commit" or "yes")