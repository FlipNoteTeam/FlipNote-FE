---
name: branch-summary
description: Summarize all changes on the current branch vs main. Groups commits by type (fix/feat/refactor/test), lists affected files, and writes a human-readable changelog. Use when asked to summarize a branch, document changes, or prepare PR notes.
metadata:
  author: flipnote
  version: "1.0.0"
---

# Branch Summary Skill

브랜치의 변경 내역을 커밋 단위로 분석해 사람이 읽기 좋은 형태로 정리한다.

## 실행 순서

### Step 1: 커밋 목록 수집

```bash
git log main..HEAD --oneline
```

- 커밋을 타입별로 분류: `fix`, `feat`, `refactor`, `test`, `chore`, `docs`
- 관련 없는 커밋(다른 기능)은 섹션을 분리해서 표시

### Step 2: 변경 파일 파악

```bash
git diff main..HEAD --stat
```

- 신규 파일 / 수정 파일 / 삭제 파일 구분
- 영향 받은 레이어(domain / feature / shared / store / test) 파악

### Step 3: 내역 정리 (출력 형식)

아래 형식으로 출력한다:

```
## 브랜치 변경 내역 (`<branch-name>`)

### Bug Fix
**`<hash>`** — <커밋 제목>
- 변경 핵심 1
- 변경 핵심 2

### Feat
...

### Refactor
...

### Test
...
```

규칙:
- 커밋 메시지를 그대로 쓰지 말고 **무엇이 왜 바뀌었는지** 한 줄로 요약
- 파일명보다 **동작/의도** 중심으로 서술
- 같은 주제의 커밋은 묶어서 표시
- 이번 대화에서 작업한 커밋과 이전 세션 커밋은 섹션으로 구분

### Step 4: 스킬 종료

정리 내역을 출력하고 종료. 추가 작업(PR 생성 등)은 사용자가 요청할 때만 진행.
