---
name: refactor
description: Refactoring workflow for this project. This skill should be used whenever the user asks to refactor, restructure, clean up, or improve existing code. Claude handles planning and test code authoring; the developer owns actual code changes unless explicitly asked otherwise.
metadata:
  author: flipnote
  version: "1.0.0"
---

# Refactor Workflow

Role split for every refactoring task:

| Step | Owner |
|---|---|
| 1. Code analysis & planning | Claude + developer (together) |
| 2. Test code authoring | Claude |
| 3. Code refactoring | Developer (leads) |

> If the developer explicitly asks Claude to refactor, Claude may proceed with step 3.

---

## Execution Order

### Step 1: Analyze

- Read the target file(s) / feature code.
- Read related architecture docs (`docs/architecture.md`, `docs/fsd-architecture-guide.md`, `docs/component-patterns.md`) as needed.
- List current problems: duplication, type mismatches, pattern violations, etc.
- Read domain/feature layer code to understand the blast radius.

### Step 2: Plan (with the developer)

- Present findings and proposed improvement direction.
- Incorporate developer feedback to finalize the refactoring scope.
- Use AskUserQuestion to resolve any ambiguities before proceeding.

### Step 3: Write test code (Claude's role)

- Write E2E regression tests **before** refactoring begins — no post-hoc tests.
- Place tests under `tests/`, filename convention: `NN-<feature>.spec.ts`.
- Confirm the tests cover current behavior, then hand off to the developer.

### Step 4: Refactor (developer leads)

- **Claude stops here.**
- Deliver this message to the developer:

```
Test code is ready.
Please proceed with the refactoring. Let me know if you get stuck.

Done criteria:
- npm run lint passes
- npx tsc -b passes
- All test scenarios pass
```

- Only proceed with code changes if the developer explicitly asks (e.g. "refactor this for me" or requests a specific edit).

---

## Hard Rules

- No `any` types.
- No unused imports.
- No commented-out dead code.
- Never modify code without a plan.
- Never refactor without tests in place first.

## Commit Convention

Use `refactor:` prefix. If the branch name contains a Jira key, the git hook inserts it automatically.
