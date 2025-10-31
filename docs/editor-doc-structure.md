# 카드셋 에디터 문서 구조

## 개요
카드셋 에디터의 Yjs 문서 구조 및 협업 기능 구현 내역

## 작업 내역

### 2025-10-31: Yjs 구조 변경 구현

#### YjsProvider 수정 (commit: caac245)
- questionText, answerText → cardsArray: Y.Array<Y.Map> 변경
- 카드 관련 메서드 추가:
  - `getCards()`: Y.Array → CardData[] 변환
  - `addCard()`: 새 카드 추가 (Y.Map 생성 및 Y.Array.push)
  - `deleteCard()`: 카드 삭제 (Y.Array.delete)
  - `updateCardTitle()`, `updateCardContent()`: 카드 필드 업데이트
  - `getCardTitleText()`, `getCardContentText()`: Y.Text 직접 접근
- Y.Array 변경 감지 및 콜백 등록 (`onCardsChange`)

#### useYjs 훅 수정 (commit: caac245)
- cards 상태 반환 (CardData[])
- 함수 제공:
  - `addCard()`
  - `deleteCard()`
  - `updateCardTitle()`
  - `updateCardContent()`
  - `getCardTitleText()`, `getCardContentText()`: 실시간 동기화용
- setAwareness 시그니처 변경: cardIndex 추가

#### CardsetEditor 컴포넌트 리팩토링 (commit: 5d645bf)
- 로컬 cards 상태 제거 → useYjs의 cards 사용
- question/answer → title/content 변경
- documentId를 카드셋 ID로 변경 (이전: 카드마다 별도 ID)
- 카드 추가/삭제 시 Yjs 자동 동기화
- 초기 카드 없으면 빈 카드 자동 추가
- 버튼 비활성화 상태 hasAccess 체크 추가

### 2025-10-31: 문서 구조 재설계

#### 문제점 (이전 구조)
- 각 카드마다 별도의 Yjs Doc 생성 (`cardset-${cardId}`)
- 카드 전환 시 매번 새로운 Doc에 연결 필요
- 카드 추가/삭제가 Yjs에 반영되지 않음 (로컬 상태만 변경)
- 협업 시 카드 목록 동기화 불가

#### 해결 방안 (새 구조)
- 카드셋 전체를 하나의 Yjs Doc으로 관리 (`cardset-${cardsetId}`)
- 카드들을 Y.Array로 관리
- 각 카드는 Y.Map으로 표현
- 카드 추가/삭제 시 Y.Array 업데이트로 모든 클라이언트에 동기화

## 문서 구조

### Yjs Document Schema

```typescript
Doc {
  "cards": Y.Array<Y.Map> [
    Y.Map {
      "id": string,           // 고유 ID (UUID)
      "question": Y.Text,     // 질문 텍스트
      "answer": Y.Text,       // 답변 텍스트
      "createdAt": number,    // 생성 시간 (timestamp)
    },
    ...
  ]
}
```

### 데이터 흐름

1. **초기 로드**
   - 서버에서 카드셋 데이터 로드
   - Yjs Doc에 초기 카드 배열 설정
   - 다른 클라이언트와 동기화

2. **카드 편집**
   - 특정 카드의 question 또는 answer Y.Text 수정
   - 자동으로 다른 클라이언트에 전파

3. **카드 추가**
   - Y.Array.push()로 새 카드 추가
   - 모든 클라이언트의 카드 목록 업데이트

4. **카드 삭제**
   - Y.Array.delete()로 카드 제거
   - 모든 클라이언트의 카드 목록 업데이트

5. **카드 순서 변경** (향후 구현)
   - Y.Array에서 요소 이동
   - 순서 변경 즉시 동기화

## 구현 세부사항

### Y.Array 사용 이유
- 순서가 있는 카드 목록 표현
- 삽입, 삭제, 이동 연산 지원
- 자동 충돌 해결 (CRDT)

### Y.Map 사용 이유
- 각 카드의 필드(id, question, answer 등) 표현
- 필드별 독립적 업데이트 가능

### Y.Text 사용 이유
- 질문/답변의 동시 편집 지원
- 문자 단위 충돌 해결
- 커서 위치 공유 가능

## 마이그레이션 가이드

### 이전 코드
```typescript
// 각 카드마다 별도 연결
const { questionText, answerText } = useYjs({
  documentId: `cardset-${cards[currentCardIndex]?.id}`,
  userId: userId,
  autoConnect: true,
});
```

### 새 코드
```typescript
// 카드셋 전체를 하나의 Doc으로 관리
const { cards, addCard, deleteCard, updateCard } = useYjs({
  documentId: `cardset-${cardsetId}`,
  userId: userId,
  autoConnect: true,
});
```

## 향후 개선 사항

- [ ] 카드 순서 변경 (드래그 앤 드롭)
- [ ] 카드 복제 기능
- [ ] 실행 취소/다시 실행 (UndoManager)
- [ ] 카드 검색 및 필터링
- [ ] 이미지, 코드 블록 등 리치 콘텐츠 지원
