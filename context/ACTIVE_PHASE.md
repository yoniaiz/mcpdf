# Active Development Phase

> This file indicates which phase agents should work on.
> Change this value to switch between implementation phases.

## Current Phase

```
v2-static-forms
```

## Available Phases

| Phase | Directory | Status | Description |
|-------|-----------|--------|-------------|
| `v1-acroforms` | `context/v1-acroforms/` | ✅ Complete | Interactive PDF forms (AcroForm) support |
| `v2-static-forms` | `context/v2-static-forms/` | 🔄 Active | Static form support (text overlay) |

## How to Switch Phases

1. Update the "Current Phase" code block above
2. Agents will automatically read from the corresponding directory

## For Agents

When starting a new session:
1. Read this file first
2. Extract the phase name from the code block
3. Read context from `context/{phase}/PRD.md` and `context/{phase}/PROGRESS.md`
4. Read shared resources from `context/resources/`
5. Read phase-specific resources from `context/{phase}/resources/`
