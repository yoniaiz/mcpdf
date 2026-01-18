# Agent Workflow Guide for mcpdf

> This document explains how AI agents should work on the mcpdf project.

## Overview

mcpdf is developed using a **task-by-task approval workflow**. Agents work on one task at a time and wait for user approval before proceeding to the next task.

---

## Phase Management

mcpdf development is organized into **phases**. Each phase has its own PRD, PROGRESS, and resources.

### How to Determine Active Phase

1. Read `context/ACTIVE_PHASE.md`
2. Extract the phase name from the code block (e.g., `v2-static-forms`)
3. Use that phase's context directory

### Available Phases

| Phase | Directory | Status | Description |
|-------|-----------|--------|-------------|
| `v1-acroforms` | `context/v1-acroforms/` | ✅ Complete | Interactive PDF forms (AcroForm) |
| `v2-static-forms` | `context/v2-static-forms/` | 🔄 Active | Static form support (text overlay) |

### Context File Resolution

Based on the active phase (e.g., `v2-static-forms`):

| File Type | Path |
|-----------|------|
| **PRD** | `context/{phase}/PRD.md` |
| **Progress** | `context/{phase}/PROGRESS.md` |
| **Phase Resources** | `context/{phase}/resources/*` |
| **Shared Resources** | `context/resources/*` |

### Switching Phases

To switch to a different phase:
1. Edit `context/ACTIVE_PHASE.md`
2. Change the code block to the new phase name
3. Agents will automatically use the new phase's context

---

## Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                     START NEW SESSION                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. READ CONTEXT FILES                                       │
│     - AGENTS.md (this file - workflow guide)                 │
│     - context/ACTIVE_PHASE.md (determine current phase)      │
│     - context/{phase}/PRD.md (requirements)                  │
│     - context/{phase}/PROGRESS.md (current status)           │
│     - context/resources/* (shared technical references)      │
│     - context/{phase}/resources/* (phase-specific refs)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. IDENTIFY NEXT TASK                                       │
│     - Find first task with status "⏳ Pending"               │
│     - Check dependencies are complete                        │
│     - Review task deliverables                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. ANNOUNCE TASK                                            │
│     - Tell user which task you're starting                   │
│     - Summarize what will be done                            │
│     - Ask for confirmation if unclear                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. IMPLEMENT TASK                                           │
│     - Work through deliverables one by one                   │
│     - Use Cursor Plan mode for complex changes               │
│     - Link plans to PROGRESS.md task (e.g., "Task 1.2")      │
│     - Test as you go                                         │
│     - Note any deviations from plan                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4.5. VERIFY QUALITY                                         │
│     - Run tests: `pnpm test` (must pass)                     │
│     - Run lint: `pnpm run lint` (must pass)                  │
│     - Run build: `pnpm run build` (must pass)                │
│     - Fix any issues before proceeding                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. UPDATE PROGRESS.md                                       │
│     - Check off completed deliverables                       │
│     - Update task status to "✅ Complete"                    │
│     - Add notes about any changes made                       │
│     - Add entry to Change Log                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  6. REPORT COMPLETION                                        │
│     - Summarize what was done                                │
│     - List any deviations or decisions made                  │
│     - Ask user for approval                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  USER APPROVAL  │
                    └─────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
       ┌──────────┐                    ┌──────────┐
       │ APPROVED │                    │ CHANGES  │
       └──────────┘                    │ REQUESTED│
              │                        └──────────┘
              │                               │
              │                               ▼
              │                  ┌─────────────────────┐
              │                  │  MAKE ADJUSTMENTS   │
              │                  │  (loop back to #4)  │
              │                  └─────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│  7. PROCEED TO NEXT TASK                                     │
│     - Return to step 2                                       │
│     - Or end session if all tasks complete                   │
└─────────────────────────────────────────────────────────────┘
```

## Key Rules

### 1. One Task at a Time
- **DO:** Complete one task fully before starting the next
- **DON'T:** Work on multiple tasks in parallel
- **DON'T:** Skip ahead without approval

### 2. Always Update PROGRESS.md
When completing a task:
```markdown
### Task X.X: Task Name
- **Status:** ✅ Complete  <!-- Update this -->
- **Plan:** [`.cursor/plans/task_x.x_name.plan.md`](.cursor/plans/task_x.x_name.plan.md)  <!-- Link your plan -->
- **Deliverables:**
  - [x] First deliverable   <!-- Check these off -->
  - [x] Second deliverable
- **Notes:** Any changes or decisions made during implementation
```

Add to Change Log:
```markdown
| 2026-01-16 | Task 1.1 | Completed project scaffolding. Used Node 20 instead of 18. |
```

### 3. Wait for Approval
After completing a task:
1. Summarize what was done
2. Mention any deviations from the plan
3. Explicitly ask: "Task X.X is complete. Should I proceed to Task X.Y?"
4. **WAIT** for user response before continuing

### 4. Reference Cursor Plan Mode
- Check what plans were created/executed in the session
- Plans show what changes were already made
- Use plan history to understand current state
- Don't redo work that's already in a plan

### 5. Handle Deviations
If you need to deviate from the PRD or task plan:
1. Explain why the deviation is needed
2. Ask for approval before proceeding
3. Document the change in PROGRESS.md notes

### 6. Quality Gates: Tests, Lint, Build Must Pass
Before marking any task complete:
1. **Run tests:** `pnpm test` - All tests must pass
2. **Run lint:** `pnpm run lint` - No lint errors
3. **Run build:** `pnpm run build` - Build must succeed
4. **Fix issues** - If any check fails, fix before proceeding
5. **Add tests** - Every new feature/tool should have tests

```bash
# Quick check - runs lint, typecheck, and tests:
pnpm run check

# Or run individually:
pnpm test && pnpm run lint && pnpm run build
```

**If checks fail:**
- Do NOT mark task as complete
- Fix the issues first
- Re-run checks until all pass
- Then proceed with completion

### 6.1 Testing with MCP Inspector
For interactive testing of the MCP server:

```bash
# Build first, then launch inspector
pnpm run build
pnpm run inspect
```

This opens the MCP Inspector UI at `http://localhost:6274` where you can:
- Verify all tools are registered correctly
- Test tool inputs and outputs interactively
- Debug server communication issues

Use this when implementing or modifying MCP tools.

### 7. Link Cursor Plans to PROGRESS.md Tasks

⚠️ **REQUIRED: Plan names MUST include phase AND task ID**

When creating a Cursor Plan, you MUST follow this naming convention:

```
{phase}/Task X.Y: [Task Name] - [Specific Action]
```

**Examples:**
| ✅ Good | ❌ Bad |
|---------|--------|
| `v2-static-forms/Task 1.2: MCP Server Setup - Initialize server` | `Task 1.2: MCP Server Setup` |
| `v2-static-forms/Task 2.3: Text Extraction - Add pdfjs-dist` | `Implement text extraction` |
| `v1-acroforms/Task 3.4: fill_field Tool - Add elicitation` | `Add elicitation feature` |

**Plan file naming:**
```
.cursor/plans/{phase}_task_{task_id}_{task_name_snake_case}_{random_8_chars}.plan.md
```
Example: `v2-static-forms_task_2.3_text_extraction_a1b2c3d4.plan.md`

**Why this matters:**
- Future agents can find plans by searching for the phase and task ID
- Creates clear traceability between tasks and implementation
- Prevents duplicate work across sessions
- Distinguishes plans from different development phases

**Full requirements:**
1. **Name plans with phase AND task ID prefix** - ALWAYS start with `{phase}/Task X.Y:`
2. **Use phase prefix in file names** - Pattern: `{phase}_task_{task_id}_*.plan.md`
3. **Reference task in plan description** - Mention which PROGRESS.md task this implements
4. **Check plans in new sessions** - Review existing plans to understand completed work
5. **Document plan outcomes** - Note in PROGRESS.md if a plan was used

**Example plan:**
```
Plan Title: v2-static-forms/Task 2.3: Text Extraction - Implement pdfjs-dist integration
Description: Implements Task 2.3 from v2-static-forms PROGRESS.md - adding text extraction using pdfjs-dist
```

This creates clear traceability between:
- PROGRESS.md tasks (what needs to be done)
- Cursor Plans (how it was done)
- Code changes (the actual implementation)
- Development phases (which phase the work belongs to)

## Context Files

### Phase-Aware Structure

```
context/
├── ACTIVE_PHASE.md              # READ FIRST - contains current phase
├── resources/                   # Shared across all phases
│   ├── LIBRARIES.md             # Common library references
│   └── MCP_EXAMPLES.md          # MCP implementation patterns
├── v1-acroforms/                # Phase 1 (completed)
│   ├── PRD.md
│   ├── PROGRESS.md
│   └── resources/
│       └── PDF_PATTERNS.md
└── v2-static-forms/             # Phase 2 (active)
    ├── PRD.md
    ├── PROGRESS.md
    └── resources/
        └── STATIC_FORM_RESEARCH.md
```

### File Reference Table

| File | Purpose | When to Read |
|------|---------|--------------|
| `AGENTS.md` | This workflow guide | Start of session |
| `context/ACTIVE_PHASE.md` | Determine current phase | Start of session (read first!) |
| `context/{phase}/PRD.md` | Phase requirements | Start of session, clarification |
| `context/{phase}/PROGRESS.md` | Task status and history | Start of session, after each task |
| `context/resources/` | Shared technical references | When implementing features |
| `context/{phase}/resources/` | Phase-specific references | When implementing phase features |

## Status Icons

| Icon | Meaning |
|------|---------|
| ⏳ | Pending - Not started |
| 🔄 | In Progress - Currently being worked on |
| ✅ | Complete - Done and approved |
| ❌ | Blocked - Cannot proceed (document why) |
| ⚠️ | Needs Review - Complete but requires attention |

## Example Task Completion Message

```
## Task 1.1: Project Scaffolding - COMPLETE ✅

### What was done:
- Initialized project with package.json (using pnpm)
- Configured TypeScript with tsconfig.json
- Set up tsdown for building
- Set up vitest for testing
- Created directory structure (src/, tests/)
- Added .gitignore and basic files

### Quality checks:
- ✅ Tests pass: `pnpm test` (1 test passing)
- ✅ Lint pass: `pnpm run lint` (no errors)
- ✅ Build pass: `pnpm run build` (compiled successfully)

### Cursor Plans used:
- Plan: "Task 1.1: Project Scaffolding - Initialize pnpm and TypeScript"

### Deviations from plan:
- Used Node 20 (minimum) instead of Node 18 as specified, 
  because MCP SDK requires Node 20+

### Files created/modified:
- package.json
- tsconfig.json
- tsdown.config.ts
- vitest.config.ts
- src/index.ts (placeholder)
- .gitignore

### Updated PROGRESS.md:
- Checked off all deliverables
- Added change log entry

---

**Should I proceed to Task 1.2: MCP Server Setup?**
```

## Handling New Sessions

When starting a fresh conversation:

1. **Read ACTIVE_PHASE.md first** - Determine which phase to work on
2. **Read phase context files** - PRD.md and PROGRESS.md from the active phase
3. **Check for existing code** - Don't overwrite completed work
4. **Announce yourself** - "I've read the context. Active phase: v2-static-forms, Task 1.1 is next."
5. **Confirm understanding** - "I'll be implementing [X]. Correct?"

## Error Recovery

If something goes wrong:

1. **Document the issue** in PROGRESS.md
2. **Mark task as blocked** if can't proceed
3. **Explain clearly** what happened and what's needed
4. **Ask for guidance** before attempting fixes

## Communication Style

### DO:
- Be concise and clear
- Use bullet points for lists
- Include code snippets when relevant
- Ask clarifying questions early
- Confirm before destructive operations

### DON'T:
- Make assumptions about requirements
- Skip the approval step
- Implement features not in the current task
- Modify code outside task scope without asking
