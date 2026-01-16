# Start Session - Read Context First

## Overview
Before doing ANY work, you MUST read and understand the project context files.

## Required Steps (DO NOT SKIP)

### Step 1: Read the Agent Workflow Guide
Read `AGENTS.md` in the project root to understand:
- The task-by-task approval workflow
- Quality gates (tests, lint, build must pass)
- How to update PROGRESS.md when completing tasks

### Step 2: Read the Progress Tracker
Read `context/PROGRESS.md` to understand:
- Which tasks are ✅ Complete
- Find the FIRST task with ⏳ Pending status
- Review its deliverables and dependencies

### Step 3: Read the Product Requirements
Read `context/PRD.md` to understand:
- The product requirements
- Feature specifications
- Technical constraints

### Step 4: Review Related Cursor Plans
Check `.cursor/plans/` for existing plans related to your next task:
- Look for plans with the task ID (e.g., `task_1.2_*.plan.md`)
- Read these plans to understand what the previous agent worked on
- Note any decisions, approaches, or partial work already done
- Avoid redoing work that's already completed in a plan

### Step 5: Check Technical Resources (if needed)
Review `context/resources/` when implementing specific features:
- `LIBRARIES.md` - Library usage patterns
- `MCP_EXAMPLES.md` - MCP server examples  
- `PDF_PATTERNS.md` - PDF handling patterns

## After Reading Context

1. **Summarize** the current project status
2. **Identify** the next pending task (Task X.Y)
3. **Report** any related plans found and what work was already done
4. **State** what you'll be implementing (continuing or starting fresh)
5. **Ask** "Should I proceed with Task X.Y?"

## DO NOT

- ❌ Start planning without reading AGENTS.md
- ❌ Skip reading PROGRESS.md to find the next task
- ❌ Skip checking `.cursor/plans/` for existing work
- ❌ Redo work that's already completed in a previous plan
- ❌ Work on tasks out of order
- ❌ Begin implementation without announcing the task first
