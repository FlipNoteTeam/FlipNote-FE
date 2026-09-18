# 실시간 카드셋 편집 요구사항

> 상태: 리팩터링 진행 중인 현재 요구사항의 단일 출처
>
> Yjs 문서 구조와 과거 구현 기록은 [editor-doc-structure.md](./editor-doc-structure.md)를 참고한다.

## 목적과 범위

카드셋 관리 권한이 있는 사용자가 같은 카드셋을 동시에 편집할 수 있게 한다. Socket.IO와 Yjs CRDT를 사용하며, 카드 목록과 질문·답변 텍스트, 편집자 presence를 실시간으로 동기화한다.

서버 WebSocket 계약은 [cardset-service.md](./api/cardset-service.md#websocket-v1card-setsws)를 따른다.

## 동작 요구사항

### 연결과 편집 권한

- 카드 편집, 카드 추가·삭제, awareness 송신은 `connected`, `hasAccess`, `hasSynced`가 모두 충족된 뒤에만 가능하다.
- 연결 중에는 편집 controls를 비활성화한다. 연결 전 빈 카드나 로컬 문서를 생성하지 않는다.
- 최초 연결 실패 시 오류 화면과 재시도 동선을 제공하며, 편집은 허용하지 않는다.
- 동기화 완료 뒤 연결이 끊기면 마지막 동기화된 카드는 읽기 전용으로 유지하고, 모든 변경 controls를 비활성화한다.
- 연결이 끊긴 동안 로컬 fallback 편집, 카드 추가·삭제, Yjs update 송신을 허용하지 않는다.
- 재연결과 첫 sync가 모두 완료된 뒤에만 편집을 다시 활성화한다.

### 동기화와 충돌 해결

- 카드셋 하나는 Yjs 문서 하나로 관리한다.
- 로컬 변경은 첫 sync 이후에만 `update` 이벤트로 전송한다.
- 원격 `sync`로 적용한 update는 다시 서버에 emit하지 않는다.
- 질문과 답변은 독립된 `Y.Text`로 관리해 두 참여자의 동시 수정이 수렴해야 한다.
- 카드 추가·삭제는 `Y.Array` 변경으로 모든 참여자에게 반영돼야 한다.
- awareness는 편집 중인 카드·필드·커서와 사용자 정보를 전달하며, 연결 해제한 사용자의 상태는 제거된다.

### 연결 lifecycle

1. Socket 연결 후 `auth`, `join-cardset`을 순서대로 전송한다.
2. 서버의 첫 `sync`를 적용한 뒤에만 편집 상태로 전환한다.
3. 화면 이탈 또는 카드셋 변경 시 `leave-cardset`을 전송하고 listener와 Yjs observer를 정리한다.
4. 연결 대기 취소·연결 실패·토큰 만료는 권한을 해제하고 편집을 차단한다.

## Yjs 문서 계약

```text
Y.Doc
└─ cards: Y.Array<Y.Map>
   └─ card: Y.Map
      ├─ id: string
      ├─ question: Y.Text
      └─ answer: Y.Text
```

카드 순서는 `cards` 배열 순서이며, 질문과 답변은 빈 문자열을 허용한다.

## 리팩터링 구조 원칙

- Socket 연결 같은 범용 transport는 `shared`에 둔다.
- 카드셋 ID, 카드 스키마, 카드 CRUD, Yjs 문서 규칙을 아는 협업 provider는 카드셋 협업 feature가 소유한다.
- React hook은 provider의 lifecycle과 snapshot을 React 렌더링 state로 연결하는 역할만 맡는다. Provider와 hook이 권한·연결 상태를 각각 독립적으로 소유하지 않는다.
- UI 컴포넌트는 협업 상태를 렌더링하고 사용자 이벤트를 전달하며, Socket/Yjs protocol을 직접 처리하지 않는다.

## 회귀 테스트 기준

- Provider 단위 테스트: 연결, sync, 원격 update 재전송 방지, 카드 CRUD, awareness, disconnect
- Provider 통합 테스트: 두 참여자의 카드·텍스트·awareness 동기화
- Hook 테스트: 연결·동기화·실패·재시도·해제 상태 전이
- Editor 테스트: sync 완료 후 Y.Text 편집, 카드 CRUD 요청, 연결 상태별 controls
- E2E: 연결 실패와 재시도 UI. 실제 dev 서버에서는 탭 두 개로 연결 성공·동시 편집·재연결을 수동 검증한다.

## 현재 알려진 정합성 공백

현재 `CardsetEditor`에는 과거 local fallback 구현이 남아 있다. 이 문서의 연결 중·연결 해제 시 편집 차단 요구사항을 리팩터링의 우선 기준으로 삼아 제거 또는 변경한다.
