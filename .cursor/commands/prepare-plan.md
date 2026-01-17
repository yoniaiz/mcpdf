# Prepare for Plan - Gather Context & Research

## Overview
This command prepares everything needed to create a plan in Cursor Plan Mode. 
You will gather context, research patterns, and output a structured brief.

**After this command finishes, the user will use Cursor Plan Mode to create the plan.**

---

## Step 1: Determine Active Phase

Read `context/ACTIVE_PHASE.md` first:
- Extract the phase name from the code block (e.g., `v2-static-forms`)
- This determines which context files to read

---

## Step 2: Read Core Context Files

Read these files in parallel (using the active phase):
- `AGENTS.md` - Workflow rules and conventions
- `context/{phase}/PROGRESS.md` - Task status tracker
- `context/{phase}/PRD.md` - Product requirements

Example: If active phase is `v2-static-forms`:
- Read `context/v2-static-forms/PROGRESS.md`
- Read `context/v2-static-forms/PRD.md`

---

## Step 3: Identify the Next Task

From PROGRESS.md:
1. Find the **FIRST task** with status `⏳ Pending`
2. Verify all its **dependencies** (prerequisite tasks) are `✅ Complete`
3. If dependencies are incomplete, STOP and report the blocker

Extract from the task:
- Task ID (e.g., "Task 2.4")
- Task name
- All deliverables
- Any notes or constraints

---

## Step 4: Check for Existing Plans

Look in `.cursor/plans/` for any plans matching the task ID:
- Pattern: `task_X.Y_*.plan.md` (e.g., `task_2.4_*.plan.md`)
- If found, read them to understand any previous attempts or partial work
- Note what was already done vs what needs to be done

---

## Step 5: Understand the Current Codebase

Based on the task deliverables, explore the relevant parts of the codebase:
- Read related existing code (similar patterns, modules to modify)
- Understand the current architecture and conventions
- Identify where new code should go
- Note any existing patterns to follow

---

## Step 6: Research External Examples (if needed)

Use **octocode-mcp** tools to research patterns when the task involves:
- MCP server patterns (tools, resources, prompts)
- PDF operations (pdf-lib, pdfjs-dist)
- Unfamiliar libraries or APIs
- Complex patterns you want to validate

Research workflow:
1. `packageSearch` - Find relevant packages and their repos
2. `githubViewRepoStructure` - Explore repo layout
3. `githubSearchCode` - Find specific patterns/examples
4. `githubGetFileContent` - Read implementation details

**Goal:** Find 1-3 good examples of how similar features are implemented.

---

## Step 7: Read Technical Resources

Check resources directories for relevant documentation:

**Shared resources** (always check):
- `context/resources/LIBRARIES.md` - Library usage patterns
- `context/resources/MCP_EXAMPLES.md` - MCP server examples

**Phase-specific resources** (based on active phase):
- `context/{phase}/resources/*` - Phase-specific patterns

Example for `v2-static-forms`:
- `context/v2-static-forms/resources/STATIC_FORM_RESEARCH.md`

Only read files relevant to the current task.

---

## Step 8: Output the Planning Brief

Produce a structured brief in this format:

\`\`\`markdown
# Planning Brief: Task X.Y - [Task Name]

## Context
- **Active Phase:** {phase}
- **Task ID:** Task X.Y
- **Task Name:** [name]
- **Dependencies:** [list completed dependencies]

## Deliverables
1. [First deliverable]
2. [Second deliverable]
...

## Current State Analysis
- **Relevant existing code:** [files and patterns to follow]
- **Where new code goes:** [target directories/files]
- **Conventions to follow:** [naming, patterns, etc.]

## Research Findings
### External Examples Found
1. **[Source]:** [what pattern/approach they use]
2. **[Source]:** [what pattern/approach they use]

### Key Insights
- [Insight 1]
- [Insight 2]

## Technical Considerations
- [Consideration 1]
- [Consideration 2]
- [Any constraints or gotchas]

## Suggested Approach
[High-level approach based on research and codebase analysis]

## Files Likely to Change
- \`path/to/file1.ts\` - [what changes]
- \`path/to/file2.ts\` - [what changes]

## Open Questions (if any)
- [Question 1]
- [Question 2]
\`\`\`

---

## Final Output

End with:
\`\`\`
---
📋 **Planning Brief Complete for Task X.Y: [Task Name]**

Phase: {active_phase}

You can now use **Cursor Plan Mode** to create the implementation plan.

Suggested plan title: \`Task X.Y: [Task Name] - [Main Action]\`
\`\`\`

---

## DO NOT
- ❌ Start implementing code
- ❌ Create the plan yourself (user will do this in Plan Mode)
- ❌ Skip the research phase
- ❌ Proceed if dependencies are incomplete
- ❌ Provide vague or incomplete briefs
- ❌ Skip reading ACTIVE_PHASE.md first
