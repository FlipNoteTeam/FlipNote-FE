# FlipNote FSD 아키텍처 가이드

> Feature-Sliced Design 원칙을 적용한 FlipNote 프론트엔드 아키텍처 가이드

## 목차
1. [FSD란?](#fsd란)
2. [핵심 원칙](#핵심-원칙)
3. [레이어 구조](#레이어-구조)
4. [슬라이스 네이밍 전략](#슬라이스-네이밍-전략)
5. [다중 도메인 처리](#다중-도메인-처리)
6. [실전 예시](#실전-예시)
7. [마이그레이션 가이드](#마이그레이션-가이드)

---

## FSD란?

**Feature-Sliced Design**은 프론트엔드 프로젝트의 확장성과 유지보수성을 위한 아키텍처 방법론입니다.

### 핵심 개념

1. **레이어(Layers)**: 수평적 책임 분리
2. **슬라이스(Slices)**: 비즈니스 도메인별 수직 분리
3. **세그먼트(Segments)**: 코드 목적별 분리 (ui, model, api, lib)

### 왜 FSD인가?

- ✅ **명확한 의존성 규칙**: 위에서 아래로만 의존
- ✅ **플랫한 구조**: 깊은 중첩 없이 한눈에 파악
- ✅ **독립적인 기능**: feature 간 의존 없음
- ✅ **확장성**: 새 기능 추가 시 기존 코드 영향 최소화

---

## 핵심 원칙

### 1️⃣ 단방향 의존성

```
pages → widgets → features → entities → shared
  ↓        ↓         ↓          ↓          ✗
(상위 레이어는 하위 레이어만 import 가능)
```

**규칙**:
```typescript
// ✅ 허용
features/auth-login/ → entities/user/ ✅
features/auth-login/ → shared/ui/ ✅

// ❌ 금지
entities/user/ → entities/cardset/ ❌
features/auth-login/ → features/auth-signup/ ❌
```

### 2️⃣ Flat is Better than Nested

```
❌ 깊은 계층 (찾기 어려움)
features/
  └── auth/
      └── login/
          └── components/
              └── forms/
                  └── LoginForm.tsx

✅ 평평한 구조 (한눈에 파악)
features/
  ├── auth-login/
  │   └── ui/
  │       └── LoginForm.tsx
  └── auth-signup/
      └── ui/
          └── SignupForm.tsx
```

### 3️⃣ Public API 패턴

각 슬라이스는 `index.ts`를 통해서만 export:

```typescript
// features/auth-login/index.ts
export { LoginForm } from './ui/LoginForm'
export { useLogin } from './model/useLogin'
export { validateLoginForm } from './lib/validation'

// 사용
import { LoginForm } from '@/features/auth-login'  // ✅

// ❌ 직접 import 금지
import { LoginForm } from '@/features/auth-login/ui/LoginForm'
```

---

## 레이어 구조

### 표준 FSD 레이어

```
📁 src/
  ├── app/              # 앱 초기화, 라우터, 전역 설정
  ├── pages/            # 라우트 페이지 (조합 레이어)
  ├── widgets/          # 독립적인 큰 UI 블록
  ├── features/         # 사용자 시나리오/액션
  ├── entities/         # 비즈니스 엔티티
  └── shared/           # 재사용 가능한 코드
```

### FlipNote 적용 구조

```
📁 src/
  ├── routes/           # app (TanStack Router)
  ├── pages/            # pages
  ├── widgets/          # widgets (선택)
  ├── features/         # features
  ├── domain/           # entities (비즈니스 엔티티)
  ├── shared/           # shared
  └── stores/           # 전역 상태 (app의 일부)
```

---

## 각 레이어 상세

### 1. Routes (App Layer)

**역할**: 라우팅 정의 및 앱 초기화

**포함**:
- TanStack Router 라우트 정의
- Pages 컴포넌트 연결만

```typescript
// routes/auth/login.tsx
import { LoginPage } from '@/pages/auth/LoginPage'

export default function LoginRoute() {
  return <LoginPage />  // Pages 호출만
}
```

**규칙**: **최대한 얇게, 라우팅만**

---

### 2. Pages

**역할**: 라우트별 페이지 구성 (조합 레이어)

**포함**:
- 페이지 레이아웃 (container, grid 등)
- 여러 features/widgets 조합
- 페이지 레벨 UI 상태만 (사이드바 열림/닫힘 등)

```typescript
// pages/auth/LoginPage.tsx
import { LoginForm } from '@/features/auth-login'
import BaseLayout from '@/shared/layouts/base-layout'

export const LoginPage = () => {
  return (
    <BaseLayout>
      <div className="container mx-auto px-4 py-8">
        <h1>로그인</h1>
        <LoginForm />  {/* Feature 조합 */}
      </div>
    </BaseLayout>
  )
}
```

**금지**:
- ❌ 비즈니스 로직
- ❌ 데이터 fetching 정의
- ❌ 복잡한 상태 관리

---

### 3. Widgets (선택)

**역할**: 여러 features를 조합한 독립적인 UI 블록

**예시**:
- Dashboard 헤더
- 사이드바
- 복잡한 필터 패널

**FlipNote**: 필요시 추가 (현재는 features로 충분)

---

### 4. Features

**역할**: 사용자의 **행동/액션**을 처리하는 비즈니스 기능

**핵심 판단 기준**: **"~하기"로 표현 가능한가?**

```
✅ Features에 속하는 것:
- 로그인하기
- 회원가입하기
- 카드셋 생성하기
- 그룹에 초대하기
- 카드셋을 그룹에 공유하기

❌ Features가 아닌 것:
- User 엔티티 (→ entities)
- 버튼 컴포넌트 (→ shared)
```

**내부 구조**:
```
📁 features/{domain}-{action}/
  ├── ui/                    # UI 컴포넌트
  │   ├── {Action}Form.tsx
  │   └── {Action}Button.tsx
  ├── model/                 # 상태 관리, 비즈니스 로직
  │   ├── use{Action}.ts
  │   └── types.ts
  ├── lib/                   # 유틸리티 (validation 등)
  │   └── validation.ts
  ├── api/                   # API 호출 (선택)
  │   └── {action}Api.ts
  └── index.ts               # Public API
```

**예시**:
```
features/
  ├── auth-login/            # 인증 - 로그인
  ├── auth-signup/           # 인증 - 회원가입
  ├── cardset-create/        # 카드셋 - 생성
  ├── cardset-share-to-group/  # 카드셋을 그룹에 공유
  └── group-member-invite/   # 그룹에 멤버 초대
```

**규칙**:
- ✅ 여러 entities 사용 가능
- ❌ 다른 feature를 import 금지
- ✅ 독립적으로 동작 가능

---

### 5. Entities (Domain)

**역할**: 비즈니스 **엔티티**(명사)와 관련된 모든 것

**포함**:
- 엔티티 UI 컴포넌트
- 엔티티 타입 정의
- 엔티티 API
- 엔티티 모델

**내부 구조**:
```
📁 entities/{entity-name}/
  ├── ui/                    # UI 컴포넌트
  │   ├── {Entity}Card.tsx
  │   ├── {Entity}List.tsx
  │   └── {Entity}Avatar.tsx
  ├── model/                 # 비즈니스 로직
  │   ├── types.ts
  │   └── use{Entity}.ts
  ├── api/                   # API
  │   └── {entity}Api.ts
  └── index.ts               # Public API
```

**예시**:
```
entities/
  ├── user/
  │   ├── ui/
  │   │   ├── UserCard.tsx
  │   │   ├── UserAvatar.tsx
  │   │   └── UserProfile.tsx
  │   ├── model/
  │   │   ├── types.ts
  │   │   └── useUser.ts
  │   └── api/
  │
  ├── cardset/
  │   ├── ui/
  │   │   ├── CardsetCard.tsx
  │   │   ├── CardsetPreview.tsx
  │   │   └── CardsetTitle.tsx
  │   └── model/
  │
  └── group/
      ├── ui/
      │   ├── GroupBadge.tsx
      │   └── GroupCard.tsx
      └── api/
```

**규칙**:
- ✅ 하나의 엔티티만 다룸
- ❌ 다른 entity를 import 금지
- ✅ 순수하고 재사용 가능

---

### 6. Shared

**역할**: 비즈니스 로직이 없는 순수 재사용 코드

**포함**:
```
shared/
  ├── ui/              # UI 컴포넌트 (Button, Input, Card)
  ├── api/             # API 클라이언트
  ├── lib/             # 유틸 함수
  ├── hooks/           # 범용 hooks (useDebounce, useLocalStorage)
  ├── layouts/         # 레이아웃 컴포넌트
  └── config/          # 설정 파일
```

**특징**:
- 도메인에 독립적
- 비즈니스 로직 없음
- 프로젝트 전반에서 사용

---

## 슬라이스 네이밍 전략

### 기본 패턴

```
{domain}-{action}
{domain}-{action}-{target}
{domainA}-{domainB}-{action}
```

### 1️⃣ 단일 도메인 액션

```
features/
  ├── auth-login              # 인증 - 로그인
  ├── auth-signup             # 인증 - 회원가입
  ├── auth-reset-password     # 인증 - 비밀번호 재설정
  ├── cardset-create          # 카드셋 - 생성
  ├── cardset-edit            # 카드셋 - 편집
  ├── cardset-delete          # 카드셋 - 삭제
  ├── group-create            # 그룹 - 생성
  └── user-profile-edit       # 유저 프로필 - 편집
```

### 2️⃣ 특정 대상에 대한 액션

```
features/
  ├── cardset-share-to-group     # 카드셋을 그룹에 공유
  ├── user-invite-to-group       # 유저를 그룹에 초대
  └── cardset-add-to-favorites   # 카드셋을 즐겨찾기에 추가
```

### 3️⃣ 도메인 간 관계 액션

```
features/
  ├── group-study-session        # 그룹 학습 세션
  ├── user-cardset-progress      # 사용자 카드셋 진행률
  └── group-member-manage        # 그룹 멤버 관리
```

### 네이밍 체크리스트

```
✅ 이름만 보고 기능을 알 수 있나?
✅ 파일 시스템에서 자동 정렬되나?
✅ 검색하기 쉬운가?
✅ 너무 길지 않나? (4단어 이하)
✅ 액션이 명확한가?
```

### 동사 선택 가이드

```typescript
// CRUD
create, add, new        // 생성
view, show, list        // 조회
edit, update, modify    // 수정
delete, remove          // 삭제

// 인증/권한
login, signup, logout
verify, reset-password, change-password

// 관계
invite, accept, reject
join, leave
share, unshare
follow, unfollow
favorite, unfavorite

// 상태
activate, deactivate
enable, disable
publish, unpublish
archive, restore
```

---

## 다중 도메인 처리

### 원칙: Feature는 여러 Entity를 사용할 수 있다

```
features/cardset-share-to-group/
  ↓ 사용
entities/cardset/  ✅
entities/group/    ✅
entities/user/     ✅
```

### 예시: 카드셋을 그룹에 공유

```typescript
// features/cardset-share-to-group/ui/ShareToGroupModal.tsx
import { CardsetPreview } from '@/entities/cardset'  // cardset 엔티티
import { GroupList } from '@/entities/group'         // group 엔티티
import { Button } from '@/shared/ui'

export const ShareToGroupModal = ({ cardsetId }: Props) => {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])

  const { mutate: shareToGroup } = useShareCardsetToGroup()

  const handleShare = () => {
    shareToGroup({ cardsetId, groupIds: selectedGroups })
  }

  return (
    <Modal>
      <CardsetPreview id={cardsetId} />      {/* cardset 엔티티 */}

      <GroupList
        selectable
        onSelect={setSelectedGroups}         {/* group 엔티티 */}
      />

      <Button onClick={handleShare}>
        {selectedGroups.length}개 그룹에 공유
      </Button>
    </Modal>
  )
}
```

### 판단 기준

**질문: "이 기능이 어느 엔티티에 속하나?"**

```
한 엔티티만 다룬다
  ↓
entities/{entity}/ui/

여러 엔티티를 조합한다
  ↓
features/{name}/ui/

단순 조합만 (로직 없음)
  ↓
widgets/ 또는 pages/
```

### 예시 비교

```typescript
// ✅ Entity: 단일 엔티티만
// entities/user/ui/UserAvatar.tsx
export const UserAvatar = ({ userId }: Props) => {
  const { data: user } = useUser(userId)
  return <Avatar src={user.avatar} />
}

// ✅ Feature: 여러 엔티티 조합
// features/group-study-session/ui/StudySessionRoom.tsx
export const StudySessionRoom = () => {
  return (
    <div>
      <GroupBadge groupId={currentGroup} />           {/* group 엔티티 */}

      <div className="participants">
        {members.map(m => <UserAvatar key={m.id} />)} {/* user 엔티티 */}
      </div>

      <CardsetCard id={sessionCardset} />             {/* cardset 엔티티 */}

      <StudyTimer duration={session.duration} />      {/* study 엔티티 */}
    </div>
  )
}

// ❌ 잘못된 예: Entity에서 다른 entity 의존
// entities/cardset/ui/CardsetWithAuthor.tsx
import { UserAvatar } from '@/entities/user'  // ❌ entity → entity
```

---

## 실전 예시

### 예시 1: 로그인 기능

#### 디렉토리 구조
```
features/auth-login/
  ├── ui/
  │   ├── LoginForm.tsx
  │   └── EmailField.tsx
  ├── model/
  │   └── useLogin.ts
  ├── lib/
  │   └── validation.ts
  └── index.ts

entities/user/
  ├── model/
  │   └── types.ts
  └── api/
      └── userApi.ts

pages/auth/
  └── LoginPage.tsx

routes/auth/
  └── login.tsx
```

#### 코드

```typescript
// 1. features/auth-login/lib/validation.ts
export const validateLoginForm = (data: LoginFormData) => {
  const errors: Record<string, string> = {}

  if (!data.email) {
    errors.email = '이메일을 입력해주세요'
  } else if (!isValidEmail(data.email)) {
    errors.email = '올바른 이메일 형식이 아닙니다'
  }

  if (!data.password) {
    errors.password = '비밀번호를 입력해주세요'
  }

  return errors
}
```

```typescript
// 2. features/auth-login/model/useLogin.ts
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/shared/apis'
import useAuthStore from '@/stores/useAuthStore'

export const useLogin = () => {
  const updateAccessToken = useAuthStore((state) => state.updateAccessToken)

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (res) => {
      await updateAccessToken(res.data.data.accessToken)
    },
  })
}
```

```typescript
// 3. features/auth-login/ui/LoginForm.tsx
import { useForm } from 'react-hook-form'
import { useLogin } from '../model/useLogin'
import { validateLoginForm } from '../lib/validation'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { mutate: login, isPending } = useLogin()

  const onSubmit = (data) => {
    const validationErrors = validateLoginForm(data)
    if (Object.keys(validationErrors).length > 0) return

    login(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('email')}
        placeholder="이메일"
        error={errors.email}
      />
      <Input
        type="password"
        {...register('password')}
        placeholder="비밀번호"
        error={errors.password}
      />
      <Button type="submit" loading={isPending}>
        로그인
      </Button>
    </form>
  )
}
```

```typescript
// 4. features/auth-login/index.ts (Public API)
export { LoginForm } from './ui/LoginForm'
export { useLogin } from './model/useLogin'
export { validateLoginForm } from './lib/validation'
```

```typescript
// 5. pages/auth/LoginPage.tsx
import { LoginForm } from '@/features/auth-login'
import BaseLayout from '@/shared/layouts/base-layout'

export const LoginPage = () => {
  return (
    <BaseLayout>
      <div className="container mx-auto max-w-md">
        <h1 className="text-3xl mb-6">로그인</h1>
        <LoginForm />
      </div>
    </BaseLayout>
  )
}
```

```typescript
// 6. routes/auth/login.tsx
import { LoginPage } from '@/pages/auth/LoginPage'

export default function LoginRoute() {
  return <LoginPage />
}
```

---

### 예시 2: 카드셋을 그룹에 공유

#### 디렉토리 구조
```
features/cardset-share-to-group/
  ├── ui/
  │   └── ShareToGroupModal.tsx
  ├── model/
  │   └── useShareToGroup.ts
  └── index.ts

entities/cardset/
  ├── ui/
  │   └── CardsetPreview.tsx
  └── api/

entities/group/
  ├── ui/
  │   └── GroupList.tsx
  └── api/
```

#### 코드

```typescript
// 1. features/cardset-share-to-group/model/useShareToGroup.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cardsetApi } from '@/shared/apis'

export const useShareToGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cardsetId, groupIds }: ShareToGroupParams) =>
      cardsetApi.shareToGroups(cardsetId, groupIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cardsets'] })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
```

```typescript
// 2. features/cardset-share-to-group/ui/ShareToGroupModal.tsx
import { useState } from 'react'
import { CardsetPreview } from '@/entities/cardset'
import { GroupList } from '@/entities/group'
import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'
import { useShareToGroup } from '../model/useShareToGroup'

type Props = {
  cardsetId: string
  isOpen: boolean
  onClose: () => void
}

export const ShareToGroupModal = ({ cardsetId, isOpen, onClose }: Props) => {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const { mutate: share, isPending } = useShareToGroup()

  const handleShare = () => {
    share(
      { cardsetId, groupIds: selectedGroups },
      { onSuccess: onClose }
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl mb-4">그룹에 공유</h2>

      <CardsetPreview id={cardsetId} />

      <div className="mt-4">
        <GroupList
          selectable
          selectedIds={selectedGroups}
          onSelect={setSelectedGroups}
        />
      </div>

      <div className="flex gap-2 mt-6">
        <Button onClick={onClose} variant="outline">
          취소
        </Button>
        <Button
          onClick={handleShare}
          loading={isPending}
          disabled={selectedGroups.length === 0}
        >
          {selectedGroups.length}개 그룹에 공유
        </Button>
      </div>
    </Modal>
  )
}
```

```typescript
// 3. entities/cardset/ui/CardsetPreview.tsx
import { useCardset } from '../model/useCardset'
import { Card } from '@/shared/ui/card'

type Props = {
  id: string
}

export const CardsetPreview = ({ id }: Props) => {
  const { data: cardset, isLoading } = useCardset(id)

  if (isLoading) return <Card.Skeleton />

  return (
    <Card>
      <h3>{cardset.title}</h3>
      <p>{cardset.description}</p>
      <span>{cardset.cardCount}개의 카드</span>
    </Card>
  )
}
```

```typescript
// 4. entities/group/ui/GroupList.tsx
import { useGroups } from '../model/useGroups'
import { Checkbox } from '@/shared/ui/checkbox'

type Props = {
  selectable?: boolean
  selectedIds?: string[]
  onSelect?: (ids: string[]) => void
}

export const GroupList = ({ selectable, selectedIds = [], onSelect }: Props) => {
  const { data: groups, isLoading } = useGroups()

  const handleToggle = (groupId: string) => {
    if (!onSelect) return

    const newSelected = selectedIds.includes(groupId)
      ? selectedIds.filter(id => id !== groupId)
      : [...selectedIds, groupId]

    onSelect(newSelected)
  }

  return (
    <div className="space-y-2">
      {groups?.map(group => (
        <div key={group.id} className="flex items-center gap-2">
          {selectable && (
            <Checkbox
              checked={selectedIds.includes(group.id)}
              onCheckedChange={() => handleToggle(group.id)}
            />
          )}
          <span>{group.name}</span>
        </div>
      ))}
    </div>
  )
}
```

---

## 마이그레이션 가이드

### FlipNote 기존 구조 → FSD 구조

#### Before (현재)
```
features/
  ├── group-invitation-management/
  ├── group-join-management/
  ├── notification-management/
  ├── user-info-management/
  └── my-study/
```

#### After (FSD)
```
features/
  ├── group-invite-member/         # 그룹에 멤버 초대
  ├── group-invitation-accept/     # 초대 수락
  ├── group-invitation-reject/     # 초대 거절
  ├── group-join/                  # 그룹 가입
  ├── group-leave/                 # 그룹 탈퇴
  ├── notification-list/           # 알림 목록 조회
  ├── notification-mark-read/      # 알림 읽음 처리
  ├── user-profile-edit/           # 프로필 수정
  ├── user-settings-update/        # 설정 변경
  ├── study-progress-view/         # 학습 진행 현황
  └── study-history/               # 학습 기록
```

### 단계별 마이그레이션

#### Phase 1: 네이밍 변경 (영향 범위 확인)
```bash
# 1. 기존 feature 사용처 검색
grep -r "group-invitation-management" src/

# 2. 새 이름으로 폴더 생성
mkdir -p src/features/group-invite-member

# 3. 파일 이동 및 import 수정
# 4. 기존 폴더 삭제
```

#### Phase 2: 구조 재구성
```
Before:
features/user-info-management/
  ├── components/
  │   └── user-profile-edit-form.tsx
  └── hooks/
      └── useUserEdit.ts

After:
features/user-profile-edit/
  ├── ui/                          # components → ui
  │   └── ProfileEditForm.tsx
  ├── model/                       # hooks → model
  │   └── useProfileEdit.ts
  └── index.ts                     # Public API 추가
```

#### Phase 3: Public API 구현
```typescript
// features/user-profile-edit/index.ts
export { ProfileEditForm } from './ui/ProfileEditForm'
export { useProfileEdit } from './model/useProfileEdit'

// 사용하는 곳 수정
// Before
import { ProfileEditForm } from '@/features/user-info-management/components/user-profile-edit-form'

// After
import { ProfileEditForm } from '@/features/user-profile-edit'
```

### 체크리스트

```
□ 모든 feature가 {domain}-{action} 패턴 준수
□ 각 feature에 index.ts (Public API) 존재
□ feature 간 import 없음
□ entity 간 import 없음
□ 의존성 방향 준수 (pages → features → entities → shared)
□ 세그먼트 구조 통일 (ui, model, lib, api)
```

---

## 실수 방지

### ❌ 실수 1: Entity에서 다른 entity import

```typescript
// entities/cardset/ui/CardsetWithAuthor.tsx - 나쁨!
import { UserAvatar } from '@/entities/user'  // ❌ entity → entity

export const CardsetWithAuthor = ({ cardset }) => {
  return (
    <div>
      <h3>{cardset.title}</h3>
      <UserAvatar userId={cardset.authorId} />  {/* ❌ */}
    </div>
  )
}
```

**해결**: Feature로 분리
```typescript
// features/cardset-view/ui/CardsetView.tsx - 좋음!
import { CardsetCard } from '@/entities/cardset'  // ✅ feature → entity
import { UserAvatar } from '@/entities/user'      // ✅ feature → entity

export const CardsetView = ({ cardset }) => {
  return (
    <div>
      <CardsetCard cardset={cardset} />
      <UserAvatar userId={cardset.authorId} />
    </div>
  )
}
```

### ❌ 실수 2: Feature 간 import

```typescript
// features/auth-login/ui/LoginForm.tsx - 나쁨!
import { SignupLink } from '@/features/auth-signup'  // ❌ feature → feature
```

**해결**: Page에서 조합
```typescript
// pages/auth/LoginPage.tsx - 좋음!
import { LoginForm } from '@/features/auth-login'      // ✅
import { SignupLink } from '@/features/auth-signup'    // ✅

export const LoginPage = () => {
  return (
    <div>
      <LoginForm />
      <SignupLink />  {/* Page에서 조합 */}
    </div>
  )
}
```

### ❌ 실수 3: Pages에 비즈니스 로직

```typescript
// pages/CardsetPage.tsx - 나쁨!
export const CardsetPage = () => {
  const [data, setData] = useState()
  const { mutate } = useMutation(...)

  // 100줄의 로직...  ❌

  return <div>...</div>
}
```

**해결**: Feature로 추출
```typescript
// pages/CardsetPage.tsx - 좋음!
import { CardsetManagement } from '@/features/cardset-manage'

export const CardsetPage = () => {
  return (
    <BaseLayout>
      <div className="container">
        <CardsetManagement />  {/* 로직은 feature에 */}
      </div>
    </BaseLayout>
  )
}
```

### ❌ 실수 4: 너무 깊은 네이밍

```
❌ features/cardset-share-to-specific-group-with-permission/
✅ features/cardset-share-to-group/
```

### ❌ 실수 5: -management 접미사

```
❌ features/user-info-management/        # 너무 광범위
✅ features/user-profile-edit/           # 구체적인 액션
✅ features/user-settings-update/
```

---

## 기술적 규칙

### 1. Import 순서

```typescript
// 1. 외부 라이브러리
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. 내부 절대 경로 (레이어 순서대로)
import { Button } from '@/shared/ui/button'
import { UserAvatar } from '@/entities/user'
import { LoginForm } from '@/features/auth-login'

// 3. 상대 경로
import { validateForm } from './lib/validation'

// 4. 타입
import type { User } from '@/entities/user'
```

### 2. 세그먼트 구조

```
📁 features/{feature-name}/
  ├── ui/           # React 컴포넌트
  ├── model/        # 상태 관리, hooks, 비즈니스 로직
  ├── lib/          # 유틸리티 (순수 함수)
  ├── api/          # API 호출 (선택)
  ├── config/       # 설정 (선택)
  └── index.ts      # Public API (필수)
```

### 3. 타입 정의

```typescript
// entities/user/model/types.ts
export type User = {
  id: string
  email: string
  name: string
}

export type UserProfile = User & {
  bio: string
  avatar: string
}

// features/auth-login/model/types.ts
export type LoginFormData = {
  email: string
  password: string
}
```

### 4. API 호출

```typescript
// shared/api/client.ts - API 클라이언트
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// entities/user/api/userApi.ts - Entity API
export const userApi = {
  getUser: (userId: string) =>
    apiClient.get<User>(`/users/${userId}`),

  updateUser: (userId: string, data: Partial<User>) =>
    apiClient.patch(`/users/${userId}`, data),
}

// features/auth-login/model/useLogin.ts - Feature에서 사용
import { authApi } from '@/shared/apis'

export const useLogin = () => {
  return useMutation({
    mutationFn: authApi.login,
    // ...
  })
}
```

---

## FAQ

### Q1: Feature vs Entity 구분이 애매할 때는?

**A**: 다음 질문으로 판단:
1. **"~하기"로 표현되나?** → Feature
2. **"User", "Cardset" 같은 명사인가?** → Entity
3. **여러 entity를 조합하나?** → Feature
4. **단일 entity만 다루나?** → Entity

### Q2: Feature가 한 곳에서만 쓰이면?

**A**:
- 미래에 재사용 가능성이 있으면 → Feature
- 확실히 재사용 안 하면 → 일단 Entity/Page에 두고 필요시 이동

### Q3: Widgets는 언제 쓰나?

**A**:
- 여러 feature를 조합한 독립적인 UI 블록
- 예: Dashboard, Sidebar, ComplexFilter
- FlipNote에서는 선택사항 (features로 충분)

### Q4: 도메인 2개가 조합되면 무조건 Feature?

**A**:
- **단순 참조** (UserAvatar를 보여주기만) → Entity에 있어도 됨
- **복잡한 로직 조합** → Feature로 분리

### Q5: -management 네이밍은 안 되나?

**A**:
- ❌ 너무 광범위함
- ✅ 구체적인 액션으로 분리
- `user-management` → `user-profile-edit`, `user-settings-update`

### Q6: 슬라이스가 너무 많아지면?

**A**:
- FSD는 flat을 권장
- 100개 feature여도 각각 독립적이면 문제없음
- 검색/정렬로 쉽게 찾을 수 있음
- 필요시 폴더 그룹핑: `(auth)/login/`, `(cardset)/create/`

---

## 참고 자료

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [FSD Examples](https://github.com/feature-sliced/examples)
- [FSD Best Practices](https://feature-sliced.design/docs/guides/examples)

---

**Last Updated**: 2025-11-26
**Contributors**: Development Team
