# FlipNote Frontend Architecture

> 이 문서는 FlipNote 프론트엔드의 아키텍처 설계 원칙과 폴더 구조에 대한 가이드입니다.

## 목차
1. [아키텍처 개요](#아키텍처-개요)
2. [레이어별 설명](#레이어별-설명)
3. [판단 기준](#판단-기준)
4. [실제 예시](#실제-예시)
5. [현재 구조](#현재-구조)
6. [개선 방향](#개선-방향)

---

## 아키텍처 개요

FlipNote는 **Feature-Sliced Design (FSD)** 원칙을 기반으로 하되, 프로젝트 특성에 맞게 변형한 구조를 사용합니다.

### 핵심 원칙

1. **단일 책임 원칙**: 각 레이어와 모듈은 명확한 단일 책임을 가집니다
2. **의존성 방향**: 상위 레이어는 하위 레이어에만 의존 (routes → pages → features → domain → shared)
3. **재사용성**: 공통 로직과 컴포넌트는 적절한 레벨에서 추상화
4. **명확한 경계**: 레이어 간 명확한 책임 분리

### 레이어 구조

```
src/
├── routes/          # 라우팅 정의 (TanStack Router)
├── pages/           # 페이지 레이아웃 + 조합
├── features/        # 재사용 가능한 비즈니스 기능
├── domain/          # 도메인별 컴포넌트와 로직
├── shared/          # 공통 유틸리티 및 기본 요소
└── stores/          # 전역 상태 관리
```

---

## 레이어별 설명

### 1. Routes (라우팅 레이어)

**역할**: TanStack Router 라우팅 정의

**포함**:
- 라우트 경로 정의
- Pages 컴포넌트 연결
- 라우트 레벨 데이터 로딩 (선택적)

**제외**:
- ❌ 레이아웃 (→ Pages)
- ❌ 비즈니스 로직 (→ Features/Domain)
- ❌ UI 컴포넌트 조합 (→ Pages)

**예시**:
```typescript
// routes/search.tsx
import { SearchPage } from "@/pages/SearchPage";

export default function SearchRoute() {
  return <SearchPage />;  // Pages 호출만
}
```

**원칙**: Routes는 얇게, 라우팅 정의에만 집중

---

### 2. Pages (페이지 레이어)

**역할**: 페이지 레이아웃 구성 + Features/Domain 조합

**포함**:
- 페이지 레이아웃 (container, padding, grid 등)
- 여러 Features/Domain 컴포넌트 조합
- 페이지 레벨 상태 관리 (사이드바 열림/닫힘 등)
- BaseLayout 적용

**제외**:
- ❌ 복잡한 비즈니스 로직 (→ Features/Domain)
- ❌ 데이터 fetching 로직 정의 (→ Domain hooks)

**예시**:
```typescript
// pages/SearchPage.tsx
import { UnifiedSearch } from "@/features/unified-search";
import BaseLayout from "@/shared/layouts/base-layout";

export const SearchPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);  // 페이지 UI 상태

  return (
    <BaseLayout>
      <div className="container mx-auto px-4 py-8">  {/* 레이아웃 */}
        <h1 className="text-3xl mb-6">통합 검색</h1>

        <div className="flex gap-4">
          {sidebarOpen && <SearchFilters />}
          <UnifiedSearch />  {/* Feature 조합 */}
        </div>
      </div>
    </BaseLayout>
  );
};
```

**핵심**: Pages는 "어떻게 배치할까"에 집중, "무엇을 할까"는 Features/Domain에

---

### 3. Features (기능 레이어)

**역할**: 여러 도메인을 조합하는 독립적 비즈니스 기능

**핵심 기준**: "여러 곳에서 재사용 가능한 독립적 비즈니스 기능"

**포함**:
- 여러 도메인 조합 (User + Notification, CardSet + User + WebSocket)
- 복잡한 비즈니스 로직
- 전역적으로 재사용되는 기능

**제외**:
- ❌ 단일 도메인의 CRUD (→ domain으로)
- ❌ 단순 UI 컴포넌트 (→ shared로)
- ❌ 페이지 레이아웃 (→ pages로)

**예시**:
```
features/
├── gnb/                              # User + Notification + Auth 조합
│   ├── components/
│   │   ├── authenticated-nav.tsx
│   │   ├── alarm-sheet.tsx
│   │   └── alarm-list.tsx
│   └── hooks/
│       ├── useNotifications.ts
│       └── useMarkAsRead.ts
│
├── unified-search/                   # Group + CardSet 검색 조합
│   ├── components/
│   │   ├── UnifiedSearch.tsx
│   │   ├── SearchBar.tsx
│   │   └── SearchTabs.tsx
│   └── hooks/
│       └── useSearchState.ts
│
└── collaborative-cardset-editor/     # CardSet + User + WebSocket 조합
    ├── components/
    │   ├── CardsetEditor.tsx
    │   └── ActiveUsersIndicator.tsx
    └── hooks/
        └── useCollaborativeEdit.ts
```

---

### 4. Domain (도메인 레이어)

**역할**: 단일 도메인의 컴포넌트, 로직, 타입

**포함**:
- 도메인별 UI 컴포넌트
- 도메인별 hooks (데이터 fetching, CRUD)
- 도메인 타입 정의
- 도메인 유틸 함수

**특징**:
- 단일 도메인에 집중
- 다른 도메인 참조는 가능하지만, 복잡한 조합은 features로

**구조**:
```
domain/
├── user/
│   ├── components/
│   │   ├── UserProfileView.tsx      # 조회 UI
│   │   ├── UserProfileEditForm.tsx  # 수정 UI
│   │   └── OtherUserProfile.tsx
│   ├── hooks/
│   │   ├── useUser.ts               # 조회
│   │   └── useUserEdit.ts           # 수정 로직
│   └── types.ts
│
├── group/
│   ├── components/
│   │   ├── GroupInfoCard.tsx
│   │   ├── GroupFilterSection.tsx
│   │   └── GroupSearchResults.tsx   # 그룹 검색 결과
│   ├── hooks/
│   │   ├── useGroupDetail.ts
│   │   └── useGroupSearch.ts        # 그룹 검색 API
│   └── types.ts
│
└── cardsets/
    ├── components/
    │   ├── CardsetCard.tsx
    │   ├── CardsetCreateForm.tsx    # 단순 생성
    │   └── CardSetSearchResults.tsx # 카드셋 검색 결과
    └── hooks/
        ├── useCardsets.ts
        └── useCardSetSearch.ts      # 카드셋 검색 API
```

---

### 5. Shared (공유 레이어)

**역할**: 프로젝트 전반에서 사용되는 공통 요소

**포함**:
- UI 컴포넌트 (Button, Input, Card 등)
- API 클라이언트
- 공통 hooks (useDebounce, useLocalStorage 등)
- 유틸 함수
- 레이아웃 컴포넌트

**특징**:
- 비즈니스 로직 없음
- 범용적으로 사용 가능
- 도메인에 독립적

---

### 6. Stores (전역 상태)

**역할**: Zustand를 사용한 전역 상태 관리

**포함**:
- 인증 상태 (useAuthStore)
- 전역 UI 상태
- 앱 전체에서 공유되는 상태

**규칙**:
- 필요한 컴포넌트에서 직접 구독 (props drilling 방지)
- 각 store는 단일 책임

---

## 판단 기준

### 레이어 선택 플로우

```
새로운 기능 추가 시
│
├─ 라우트 정의인가? ──YES──> routes/
│
├─ 페이지 레이아웃/조합인가? ──YES──> pages/
│
├─ 여러 도메인이 복잡하게 조합되나? ──YES──> features/
│                                          (독립적 기능으로 네이밍)
├─ NO
│
├─ 단일 도메인의 기능인가? ──YES──> domain/{domain-name}/
│
├─ NO
│
└─ 범용적 유틸리티인가? ──YES──> shared/
```

### Domain vs Features 구분

#### ✅ Domain에 위치
- 단일 도메인의 CRUD
- 도메인 데이터의 단순 참조/표시
- 도메인별 UI 컴포넌트

**예시**:
- User 프로필 조회/수정
- Group 생성/조회/검색
- CardSet 단순 생성

#### ✅ Features에 위치
- **여러 도메인 조합**
- **독립적 비즈니스 기능**으로 명명 가능
- 여러 페이지/위젯에서 재사용

**예시**:
- GNB (User + Notification + Auth)
- 통합 검색 (Group + CardSet)
- 실시간 협업 편집 (CardSet + User + WebSocket)
- 공유 기능 (CardSet + User + Permission)
- 팔로우 기능 (User + Notification + Activity)

---

## 실제 예시

### 예시 1: 통합 검색 페이지 (Group + CardSet)

**구조**:
```
routes/
  └── search.tsx                          # 라우트 정의

pages/
  └── SearchPage.tsx                      # 레이아웃 + 조합

features/unified-search/
  ├── components/
  │   ├── UnifiedSearch.tsx               # 통합 검색 메인
  │   ├── SearchBar.tsx                   # 검색 입력
  │   └── SearchTabs.tsx                  # 탭 전환
  └── hooks/
      └── useSearchState.ts               # 검색 상태 관리

domain/group/
  ├── components/
  │   └── GroupSearchResults.tsx          # 그룹 검색 결과 표시
  └── hooks/
      └── useGroupSearch.ts               # 그룹 검색 API

domain/cardsets/
  ├── components/
  │   └── CardSetSearchResults.tsx        # 카드셋 검색 결과 표시
  └── hooks/
      └── useCardSetSearch.ts             # 카드셋 검색 API
```

**코드**:

```typescript
// 1. routes/search.tsx - 라우트 정의
import { SearchPage } from "@/pages/SearchPage";

export default function SearchRoute() {
  return <SearchPage />;
}
```

```typescript
// 2. pages/SearchPage.tsx - 레이아웃 + 조합
import { UnifiedSearch } from "@/features/unified-search";
import BaseLayout from "@/shared/layouts/base-layout";

export const SearchPage = () => {
  return (
    <BaseLayout>
      <div className="container mx-auto px-4 py-8">  {/* 레이아웃 */}
        <h1 className="text-3xl mb-6">통합 검색</h1>
        <UnifiedSearch />  {/* Feature 사용 */}
      </div>
    </BaseLayout>
  );
};
```

```typescript
// 3. features/unified-search/UnifiedSearch.tsx - 비즈니스 로직
import { useSearchState } from "../hooks/useSearchState";
import { GroupSearchResults } from "@/domain/group/components/GroupSearchResults";
import { CardSetSearchResults } from "@/domain/cardsets/components/CardSetSearchResults";

export const UnifiedSearch = () => {
  const { keyword, activeTab, setKeyword, setActiveTab } = useSearchState();

  return (
    <>
      <SearchBar value={keyword} onChange={setKeyword} />
      <SearchTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "groups" && <GroupSearchResults keyword={keyword} />}
      {activeTab === "cardsets" && <CardSetSearchResults keyword={keyword} />}
    </>
  );
};
```

```typescript
// 4. domain/group/components/GroupSearchResults.tsx - 도메인 UI
import { useGroupSearch } from "../hooks/useGroupSearch";

type Props = { keyword: string };

export const GroupSearchResults = ({ keyword }: Props) => {
  const { data, isLoading } = useGroupSearch(keyword);

  return (
    <div className="grid grid-cols-3 gap-4">
      {data?.map(group => <GroupCard key={group.id} {...group} />)}
    </div>
  );
};
```

```typescript
// 5. domain/group/hooks/useGroupSearch.ts - 도메인 로직
export const useGroupSearch = (keyword: string) => {
  return useQuery({
    queryKey: ["groups", "search", keyword],
    queryFn: () => groupApi.search({ keyword }),
    enabled: !!keyword,
  });
};
```

**이유**:
- Group + CardSet 조합 → Features
- 각 도메인 검색 로직 → Domain hooks
- 레이아웃 → Pages
- 라우팅 → Routes

---

### 예시 2: User 프로필 페이지

**구조**:
```
routes/
  └── users/$userId.tsx                   # 라우트

pages/
  └── UserInfoPage.tsx                    # 레이아웃 + 조합

domain/user/
  ├── components/
  │   ├── UserProfileView.tsx             # 조회 UI
  │   ├── UserProfileEditForm.tsx         # 수정 UI
  │   └── OtherUserProfile.tsx            # 타인 프로필
  └── hooks/
      ├── useUser.ts                      # 조회
      └── useUserEdit.ts                  # 수정
```

**이유**: User 도메인만 → Domain에 모두

---

### 예시 3: GNB (Global Navigation Bar)

**구조**:
```
features/gnb/
  ├── components/
  │   ├── AuthenticatedNav.tsx            # User + Auth
  │   ├── AlarmSheet.tsx                  # Notification
  │   └── AlarmList.tsx
  └── hooks/
      ├── useNotifications.ts             # Notification API
      └── useMarkAsRead.ts
```

**이유**: User + Notification + Auth 조합 → Features

---

## 레이어별 책임 요약

| 레이어 | 책임 | 예시 | 금지사항 |
|--------|------|------|----------|
| **Routes** | 라우팅 정의 | `<SearchPage />` 호출 | 레이아웃, 로직, 상태 |
| **Pages** | 레이아웃 + 조합 | container, grid, Feature 배치 | 비즈니스 로직, fetching 정의 |
| **Features** | 여러 도메인 조합 기능 | 통합 검색, GNB, 협업 편집 | 단일 도메인 로직, 레이아웃 |
| **Domain** | 단일 도메인 로직 | User CRUD, Group 검색 | 다른 도메인 복잡 조합 |
| **Shared** | 공통 요소 | Button, API, 유틸 | 비즈니스 로직 |
| **Stores** | 전역 상태 | Auth, 전역 UI | 로컬 상태 |

---

## 현재 구조

### 현재 상태
```
src/
├── routes/                          # TanStack Router
│   ├── __root.tsx
│   └── ...
│
├── pages/
│   ├── auth/                        # 인증 페이지
│   ├── user/                        # 유저 관련 페이지
│   ├── create-group.tsx
│   ├── group-detail.tsx
│   └── group-list.tsx
│
├── features/
│   ├── gnb/                         ✅ 적절 (User + Notification + Auth)
│   ├── cardset/                     ⚠️ 분리 필요
│   ├── group-search/                ⚠️ domain으로 이동 고려
│   └── user-info-management/        ⚠️ domain으로 이동 고려
│
├── domain/
│   ├── user/
│   ├── group/
│   ├── cardsets/
│   └── members/
│
├── shared/
│   ├── apis/                        # API 클라이언트
│   ├── components/                  # 공통 UI
│   ├── hooks/
│   ├── layouts/
│   └── lib/
│
└── stores/
    └── useAuthStore.ts
```

---

## 개선 방향

### 1. Features 정리

#### 이동 필요
```
features/group-search/ → domain/group/
  ├── components/GroupFilterSection.tsx
  └── hooks/useGroups.ts

이유: Group 도메인의 검색/필터 기능만
```

```
features/user-info-management/ → domain/user/
  ├── components/user-profile-edit-form.tsx
  └── hooks/useUserEdit.ts

이유: User 도메인의 수정 기능만
```

#### 분리 필요
```
features/cardset/ → 분리
  ├── CardsetCreateForm → domain/cardsets/ (단순 생성)
  └── CardsetEditor → features/collaborative-cardset-editor/ (협업 편집)

이유: 협업 편집은 CardSet + User + WebSocket 조합
```

### 2. Pages 정리

모든 pages는 다음 패턴 준수:
```typescript
// ✅ 좋은 예
export const SomePage = () => {
  return (
    <BaseLayout>
      <div className="container mx-auto px-4 py-8">
        <FeatureComponent />
      </div>
    </BaseLayout>
  );
};

// ❌ 나쁜 예
export const SomePage = () => {
  const [data, setData] = useState();  // 로직이 너무 많음
  const { mutate } = useMutation(...);
  // 100줄의 로직...
};
```

### 3. 기술 스택 표준화

#### Form 관리
- **react-hook-form** 사용 (이미 설치됨)
- validation, 에러 처리 자동화
- 선언적 코드 작성

#### 상태 관리
- **React Query**: 서버 상태 (data fetching, caching)
- **Zustand**: 클라이언트 전역 상태 (auth, UI)
- **useState**: 로컬 컴포넌트 상태

#### 데이터 Fetching
```typescript
// Domain에서 hook 정의
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => userApi.getUser(userId)
  });
};

// Pages에서 호출
const { data } = useUser(userId);
```

---

## 실수 방지

### ❌ 실수 1: Routes에 레이아웃
```typescript
// routes/search.tsx - 나쁨!
export default function SearchRoute() {
  return (
    <div className="container mx-auto">  {/* ❌ */}
      <UnifiedSearch />
    </div>
  );
}
```

### ❌ 실수 2: Features에 레이아웃
```typescript
// features/unified-search - 나쁨!
export const UnifiedSearch = () => {
  return (
    <div className="px-4 py-8">  {/* ❌ */}
      <SearchBar />
    </div>
  );
};
```

### ❌ 실수 3: Domain에 다른 도메인 로직
```typescript
// domain/group/GroupDetail.tsx - 나쁨!
const { data: cardsets } = useCardSetSearch();  // ❌ CardSet 로직이 Group에
```

### ❌ 실수 4: Pages에 비즈니스 로직
```typescript
// pages/SearchPage.tsx - 나쁨!
const [keyword, setKeyword] = useState("");  // ❌ 로직은 Feature로
const { data } = useGroupSearch(keyword);
```

---

## 기술적 규칙

### 1. Import 순서
```typescript
// 1. 외부 라이브러리
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. 내부 절대 경로 (레이어 순서대로)
import { userApi } from "@/shared/apis";
import useAuthStore from "@/stores/useAuthStore";
import { UserProfileView } from "@/domain/user/components/UserProfileView";
import { UnifiedSearch } from "@/features/unified-search";

// 3. 상대 경로
import { formatDate } from "./utils";

// 4. 타입
import type { User } from "@/shared/apis/types";
```

### 2. Hooks 규칙
- Custom hooks는 `use` 접두사
- 하나의 책임만 가짐
- 재사용 가능하게 작성

### 3. Props 타입
```typescript
// Props는 명시적으로 정의
type Props = {
  userId: string;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
};

// children이 필요한 경우
type Props = {
  children: React.ReactNode;
};
```

### 4. 명명 규칙

#### 폴더명
- `kebab-case` 사용
- 명확한 기능/도메인명

#### 파일명
- 컴포넌트: `PascalCase.tsx`
- hooks: `use*.ts`
- 유틸: `camelCase.ts`

#### 컴포넌트명
- 도메인 접두사 사용 (UserProfile, GroupCard)
- 역할 명시 (View, Form, List, Card, Results)

---

## 마이그레이션 체크리스트

### 즉시 개선
- [ ] features/user-info-management → domain/user
- [ ] features/group-search → domain/group
- [ ] features/cardset 분리
  - [ ] CardsetCreateForm → domain/cardsets
  - [ ] CardsetEditor → features/collaborative-cardset-editor

### 점진적 개선
- [ ] 모든 폼을 react-hook-form으로 통일
- [ ] Pages를 얇게 유지 (레이아웃 + 조합만)
- [ ] 일관된 에러 처리 패턴 수립
- [ ] 공통 컴포넌트 문서화

### 새 기능 추가 시
- [ ] 이 가이드 참조
- [ ] Routes/Pages/Features/Domain 판단
- [ ] 코드 리뷰에서 위치 검토

---

## FAQ

### Q1: Routes vs Pages 차이는?
**A**:
- **Routes**: TanStack Router 파일 기반 라우팅, Pages 연결만
- **Pages**: 레이아웃 + Features/Domain 조합

### Q2: 복잡한 페이지는 어디에?
**A**: 페이지 자체는 `pages/`에(레이아웃만), 복잡한 로직은 features/domain으로 분리

### Q3: 두 도메인이 조합되면 무조건 features?
**A**: 아니요. **단순 참조**는 domain에, **복잡한 비즈니스 로직 조합**은 features에

### Q4: Feature가 한 곳에서만 쓰이면?
**A**: 현재는 한 곳이지만 미래에 재사용 가능성이 높다면 features에. 확실하지 않다면 domain에 두고 나중에 이동.

### Q5: Shared vs Domain?
**A**:
- **Shared**: 도메인에 독립적 (Button, Input)
- **Domain**: 특정 도메인 종속적 (UserCard, GroupFilter)

### Q6: Pages에 비즈니스 로직은 절대 안 되나?
**A**: 페이지 UI 상태(사이드바 열림/닫힘)는 OK, 데이터 조작/변환 로직은 Features/Domain으로

---

## 참고 자료

- [Feature-Sliced Design](https://feature-sliced.design/)
- [TanStack Router](https://tanstack.com/router/latest)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/best-practices)
- [React Hook Form](https://react-hook-form.com/)

---

**Last Updated**: 2025-01-28
**Contributors**: Development Team
