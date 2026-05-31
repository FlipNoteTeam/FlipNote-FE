---
name: api-integrate
description: API integration workflow for this project. This skill should be used whenever the user asks to add, modify, or verify API calls — including new feature integration, type fixes, or checking existing API functions.
metadata:
  author: flipnote
  version: "1.0.0"
---

# API Integration Workflow

## Execution Order

### Step 1: Read the API spec

Before writing or modifying any API call, read the relevant spec file(s) in `docs/api/`:

| Domain | Spec file |
|---|---|
| 알림 | `docs/api/notification-service.md` |
| 카드셋 | `docs/api/cardset-service.md` |
| 그룹 | `docs/api/group-service.md` |
| 유저 | `docs/api/user-service.md` |
| 이미지 | `docs/api/image-service.md` |
| 리액션 | `docs/api/reaction-service.md` |
| 게이트웨이/공통 | `docs/api/gateway.md` |

Always read the spec first — do not rely on training knowledge or existing code alone.

### Step 2: Verify existing API functions

For each API function involved in the task, cross-check the current implementation (`src/shared/apis/*.ts`) against the spec:

- HTTP method and path match
- Query params / request body field names and types match
- Response type matches (especially nullability: `T | null`, optional fields)
- Error codes documented in the spec are handled if needed

Flag any mismatches before proceeding.

### Step 3: Implement or fix

Apply the changes with spec-confirmed types and shapes. Follow the existing patterns in `src/shared/apis/`.

---

## Hard Rules

- Never add or modify an API call without reading `docs/api/` first.
- If the spec and existing code conflict, trust the spec and flag the discrepancy to the developer.
- No `any` types in API response/request types.
- Response types must reflect the spec exactly — including `null` where the spec says `nullable`.
