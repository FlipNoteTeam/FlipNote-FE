# FSD 도메인 분리 기준 가이드

> 이 문서는 FlipNote 프론트엔드에서 도메인(Domain)을 분리하는 기준과 Entities vs Features의 차이를 설명합니다.

## 목차
1. [도메인 분리란?](#도메인-분리란)
2. [현재 프로젝트 구조 분석](#현재-프로젝트-구조-분석)
3. [도메인 분리 기준](#도메인-분리-기준)
4. [Entities vs Features](#entities-vs-features)
5. [실전 판단 플로우](#실전-판단-플로우)
6. [공유 컴포넌트 배치 기준](#공유-컴포넌트-배치-기준)
7. [실제 사례](#실제-사례)
8. [개선 방향](#개선-방향)

---

## 도메인 분리란?

도메인 분리는 코드베이스를 **비즈니스 관심사**에 따라 나누는 것입니다. 각 도메인은 독립적인 책임과 경계를 가집니다.

### 왜 도메인을 분리하나요?

- **응집도 향상**: 관련된 코드를 한 곳에 모음
- **결합도 감소**: 도메인 간 의존성 최소화
- **유지보수성**: 변경 범위가 명확해짐
- **팀 협업**: 도메인별로 작업 분담 가능

---

## 현재 프로젝트 구조 분석

### 전체 도메인 목록

```
src/domain/
├── user/              # 사용자 프로필 및 인증
├── group/             # 그룹 관리
│   ├── invitation/    # 그룹 초대 (서브 도메인)
│   └── join-request/  # 가입 요청 (서브 도메인)
├── cardsets/          # 플래시카드 세트
├── members/           # 그룹 멤버십
├── study/             # 개인 학습 데이터
└── notification/      # 알림
```

### 각 도메인의 역할

| 도메인 | 주요 엔티티 | 역할 | API 경로 예시 |
|--------|------------|------|--------------|
| **user** | User | 사용자 프로필, 계정 정보 | `/users/{id}` |
| **group** | Group | 그룹 CRUD, 관리 | `/groups/*` |
| **group/invitation** | Invitation | 받은 초대 관리 | `/invitations/*` |
| **group/join-request** | JoinRequest | 보낸 가입 요청 관리 | `/join-requests/*` |
| **cardsets** | CardSet | 플래시카드 검색, 상호작용 | `/cardsets/*` |
| **members** | GroupMember | 그룹 멤버 조회 | `/groups/{id}/members` |
| **study** | - | 북마크/좋아요한 카드셋 | `/users/me/bookmarks` |
| **notification** | Notification | 푸시 알림 | `/notifications/*` |

### 도메인별 파일 구조

```
domain/[domain-name]/
├── components/        # UI 컴포넌트
├── hooks/            # React Query 훅
├── types.ts          # TypeScript 타입
└── index.ts          # Barrel export
```

---

## 도메인 분리 기준

### 1️⃣ 최상위 도메인: 핵심 엔티티 기준

**판단 질문**: "이게 DB 테이블이라면 별도 테이블인가?"

```typescript
// ✅ 최상위 도메인
user/       // users 테이블
group/      // groups 테이블
cardsets/   // cardsets 테이블
```

**특징**:
- 독립적인 비즈니스 엔티티
- 다른 도메인 없이도 존재 가능
- API 경로가 `/resources` 형태

---

### 2️⃣ 서브 도메인: 특정 워크플로우

**판단 질문**: "같은 엔티티의 특정 사용자 행동인가?"

```typescript
group/
  ├── (그룹 CRUD)
  ├── invitation/      // "내가 받은 초대"
  └── join-request/    // "내가 신청한 가입 요청"
```

#### 왜 분리했을까?

| 측면 | `group` (메인) | `invitation` | `join-request` |
|------|---------------|--------------|----------------|
| **주체** | 그룹 관리자 | 초대받은 사람 | 가입 신청한 사람 |
| **API** | `/groups/*` | `/invitations/*` | `/join-requests/*` |
| **화면** | 그룹 관리 페이지 | 내 초대함 | 내 신청 내역 |
| **목적** | 그룹 생성/수정/삭제 | 초대 수락/거절 | 신청 상태 조회 |
| **관점** | 관리자 관점 | 수신자 관점 | 발신자 관점 |

**서브 도메인 생성 기준**:
- ✅ 같은 부모 엔티티와 관련
- ✅ 독립적인 API 엔드포인트
- ✅ 명확히 다른 사용자 워크플로우
- ✅ 부모 없이는 존재 불가능

---

### 3️⃣ 분리 vs 통합 기준표

| 질문 | 분리 | 통합 |
|------|------|------|
| DB 테이블이 다른가? | ✅ | ❌ |
| API 경로가 다른가? | ✅ | ❌ |
| 사용자 워크플로우가 다른가? | ✅ | ❌ |
| 재사용 범위가 다른가? | ✅ | ❌ |
| 관리 주체가 다른가? | ✅ | ❌ |

---

## Entities vs Features

### 🎯 핵심 차이

| 구분 | Entities (엔티티) | Features (기능) |
|------|------------------|----------------|
| **관점** | 데이터 중심 | 사용자 행동 중심 |
| **역할** | 비즈니스 객체 | 비즈니스 로직 |
| **내용** | 타입, API, 기본 CRUD | 인터랙션, 폼, 유효성 검사 |
| **재사용** | 여러 feature에서 사용 | 특정 시나리오에서 사용 |
| **예시** | User, Group, CardSet | 로그인, 그룹 가입, 소셜 연동 |

---

### Entities (엔티티)

**정의**: "무엇"인가? (What) - 데이터 구조

```typescript
// entities/user/
types.ts              // User 타입 정의
api.ts                // API 호출 함수
model.ts              // useQuery 기본 훅

// 예시
export type User = {
  id: string;
  email: string;
  name: string;
  nickname: string;
}

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id)
  })
}
```

**특징**:
- 순수한 데이터 구조
- API 호출 로직
- 타입 정의
- 기본적인 읽기/쓰기 훅

---

### Features (기능)

**정의**: "어떻게"하는가? (How) - 사용자 행동

```typescript
// features/social-connect/
ui/
  social-connect-button.tsx     // UI 컴포넌트
  social-provider-list.tsx
model/
  use-connect-social.ts         // 비즈니스 로직
  use-disconnect-social.ts
config/
  providers.ts                  // [Kakao, Google, GitHub]

// 예시
export const useConnectSocial = () => {
  return useMutation({
    mutationFn: connectSocialAccount,
    onSuccess: () => {
      // 성공 시 토스트 표시
      // 사용자 정보 다시 불러오기
      queryClient.invalidateQueries(['user'])
    }
  })
}
```

**특징**:
- 여러 엔티티 조합
- 사용자 인터랙션 처리
- 비즈니스 로직 (유효성 검사, 에러 처리)
- UI 컴포넌트 포함

---

### 실제 비교 예시

#### ❌ 잘못된 구조 (Entity와 Feature 혼재)

```typescript
entities/
  social-account/
    types.ts                      // ✅ Entity
    api.ts                        // ✅ Entity
    components/
      connect-button.tsx          // ❌ Feature 영역!
    hooks/
      use-connect.ts              // ❌ Feature 영역!
```

#### ✅ 올바른 구조 (명확한 분리)

```typescript
entities/
  social-account/                 // 데이터만
    types.ts
    api.ts
    model.ts                      // useGetSocialAccounts (조회)

features/
  social-connect/                 // 사용자 행동
    ui/
      social-connect-button.tsx
      social-provider-list.tsx
    model/
      use-connect-social.ts       // useMutation (생성)
      use-disconnect-social.ts    // useMutation (삭제)
    config/
      providers.ts
```

---

### Widget (위젯)

**정의**: 여러 Feature를 조합한 독립적인 UI 블록

```typescript
widgets/
  user-profile/
    ui/
      user-profile-view.tsx       // Entity + Features 조합
    model/
      use-user-profile.ts
```

**예시**:
```tsx
// widgets/user-profile/ui/user-profile-view.tsx
import { useUser } from '@/entities/user'
import { SocialConnectSection } from '@/features/social-connect'
import { ProfileEditForm } from '@/features/profile-edit'

export const UserProfileView = () => {
  const { data: user } = useUser()

  return (
    <div>
      <UserInfo user={user} />
      <ProfileEditForm />          {/* Feature */}
      <SocialConnectSection />     {/* Feature */}
    </div>
  )
}
```

---

### FSD 레이어 구조 (완전한 형태)

```
src/
├── app/              # 앱 초기화, 라우터
├── pages/            # 페이지 조합
├── widgets/          # 독립적인 UI 블록
├── features/         # 사용자 기능
├── entities/         # 비즈니스 엔티티
└── shared/           # 공통 코드
```

**의존성 방향** (아래로만):
```
pages → widgets → features → entities → shared
```

---

## 실전 판단 플로우

### 최상위 도메인 vs 서브 도메인

```
질문 1: DB에서 별도 테이블인가?
  ├─ YES → 최상위 도메인 고려
  └─ NO → 서브 도메인 고려

질문 2: 다른 도메인과 독립적으로 동작하나?
  ├─ YES → 최상위 도메인
  └─ NO → 어느 도메인에 종속? → 서브 도메인

질문 3: API 경로가 어떻게 생겼나?
  ├─ /users/{id}/social-accounts → user/social-account/
  ├─ /social-accounts → social-account/
  └─ /groups/{id}/invitations → group/invitation/

질문 4: 이 기능이 여러 곳에서 쓰이나?
  ├─ YES → 최상위 도메인
  └─ NO → 서브 도메인
```

---

### Entity vs Feature 판단

```
질문 1: 이게 데이터 구조인가, 사용자 행동인가?
  ├─ 데이터 구조 → Entity
  └─ 사용자 행동 → Feature

질문 2: 여러 엔티티를 조합하나?
  ├─ YES → Feature
  └─ NO → Entity

질문 3: UI 인터랙션이 핵심인가?
  ├─ YES → Feature
  └─ NO → Entity

질문 4: "~하기" 형태로 표현되나?
  ├─ YES (로그인하기, 연동하기) → Feature
  └─ NO (사용자, 그룹) → Entity
```

---

## 공유 컴포넌트 배치 기준

### 핵심 원칙

공유 컴포넌트의 위치는 **"누가 공유하는가"**에 따라 결정됩니다.

---

### 1️⃣ Entity 내부에서만 공유

**같은 Entity의 여러 컴포넌트가 공유**

```typescript
entities/user/
  ui/
    user-profile-view.tsx         // View에서 사용
    user-info-section.tsx         // ✅ 공유 컴포넌트
    user-avatar.tsx               // ✅ 공유 컴포넌트
    user-info-field.tsx           // ✅ 공유 컴포넌트
```

**예시**:
```tsx
// entities/user/ui/user-info-field.tsx
type Props = {
  label: string;
  value: string;
  editable?: boolean;
  onChange?: (value: string) => void;
}

export const UserInfoField = ({ label, value, editable, onChange }: Props) => {
  if (editable) {
    return (
      <div>
        <Label>{label}</Label>
        <Input value={value} onChange={e => onChange?.(e.target.value)} />
      </div>
    )
  }

  return (
    <div>
      <Label>{label}</Label>
      <p>{value}</p>
    </div>
  )
}

// UserProfileView에서 사용
<UserInfoField label="이름" value={user.name} />

// UserProfileEditForm에서 사용
<UserInfoField label="이름" value={user.name} editable onChange={handleChange} />
```

**배치**: `entities/user/ui/` ✅

**이유**:
- User 엔티티에만 특화됨
- User 타입 데이터 표시
- 다른 도메인에서 사용 안 함

---

### 2️⃣ 여러 Feature가 공유

**같은 도메인의 여러 Feature가 공유**

```typescript
entities/user/
  ui/
    user-form-layout.tsx          // ✅ 유저 폼 레이아웃
    user-form-section.tsx         // ✅ 유저 폼 섹션

features/
  user-profile-edit/
    ui/user-profile-edit-form.tsx  // ↑ 이거 사용

  user-password-change/
    ui/password-change-form.tsx    // ↑ 이거 사용

  user-account-settings/
    ui/account-settings-form.tsx   // ↑ 이거 사용
```

**예시**:
```tsx
// entities/user/ui/user-form-section.tsx
type Props = {
  title: string;
  children: ReactNode;
}

export const UserFormSection = ({ title, children }: Props) => {
  return (
    <div className="border-b pb-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {children}
    </div>
  )
}
```

**배치**: `entities/user/ui/` ✅

**이유**:
- Feature는 Entity에 의존 가능 (의존성 방향: `Feature → Entity`)
- Entity는 Feature에 의존 불가능
- User 관련 Feature에만 특화된 UI

---

### 3️⃣ 여러 Entity가 공유

**User, Group, CardSet 등 여러 도메인이 공유**

```typescript
shared/
  ui/
    form-layout.tsx               // ✅ 범용 폼 레이아웃
    info-section.tsx              // ✅ 범용 정보 섹션
    avatar.tsx                    // ✅ 범용 아바타
    data-table.tsx                // ✅ 범용 테이블
```

**예시**:
```tsx
// shared/ui/form-layout.tsx
type Props = {
  title: string;
  children: ReactNode;
  onSubmit: () => void;
  onCancel: () => void;
}

export const FormLayout = ({ title, children, onSubmit, onCancel }: Props) => {
  return (
    <Card>
      <CardHeader>
        <h2>{title}</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          {children}
          <div className="flex gap-2">
            <Button type="submit">저장</Button>
            <Button type="button" onClick={onCancel}>취소</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

**배치**: `shared/ui/` ✅

**이유**:
- 도메인 무관
- 범용 UI 패턴
- 여러 곳에서 재사용

---

### 배치 결정 플로우차트

```
공유 컴포넌트가 생겼다!
  │
  ├─ Q1: 어떤 레이어가 사용하나?
  │
  ├─── 같은 Entity 내부만 (user-view, user-card 등)
  │    → entities/user/ui/
  │
  ├─── 같은 도메인의 여러 Feature (user-edit, user-delete)
  │    → entities/user/ui/  (Feature는 Entity에 의존)
  │
  ├─── 여러 Entity (user, group, cardset)
  │    → shared/ui/
  │
  └─── 여러 Feature, 여러 Entity
       → shared/ui/
```

---

### 의존성 방향 원칙

```
pages → widgets → features → entities → shared
```

**중요**:
- ✅ Feature는 Entity에 의존 가능
- ❌ Entity는 Feature에 의존 불가능
- ✅ 모든 레이어는 Shared에 의존 가능

**예시**:

```typescript
// ✅ 가능: Feature가 Entity 사용
// features/user-profile-edit/ui/edit-form.tsx
import { UserAvatar } from '@/entities/user'

// ❌ 불가능: Entity가 Feature 사용
// entities/user/ui/user-card.tsx
import { EditButton } from '@/features/user-profile-edit'  // ❌

// ✅ 해결: Shared로 올리거나, props로 받기
type Props = {
  user: User;
  onEdit?: () => void;  // 외부에서 주입
}
```

---

### 판단 기준표

| 공유 범위 | 배치 위치 | 예시 |
|----------|----------|------|
| 같은 Entity 내부 | `entities/user/ui/` | UserInfoField, UserAvatar |
| Entity + Features (같은 도메인) | `entities/user/ui/` | UserFormSection |
| 여러 Entity | `shared/ui/` | FormLayout, Avatar, Button |
| 전체 앱 | `shared/ui/` | Card, Input, Label |

---

### 황금률

#### 1. 특화도 테스트

```
"이 컴포넌트 이름에서 도메인을 빼도 의미가 있나?"

UserAvatar     → Avatar     (✅ 의미 있음 → Shared 가능)
UserInfoField  → InfoField  (❌ 모호함 → Entity에 둠)
UserFormSection → FormSection (⚠️ 애매 → User 전용이면 Entity)
```

#### 2. 재사용 범위 테스트

```
1개 Entity만           → entities/[entity]/ui/
2개 이상 Entity        → shared/ui/
모든 곳                → shared/ui/
```

#### 3. 변경 가능성 테스트

```
"User 요구사항이 바뀌면 이것도 바뀌나?"

YES → entities/user/ui/
NO  → shared/ui/
```

---

### 실전 시나리오

#### 시나리오 1: UserAvatar 컴포넌트

**사용처 체크리스트**:
- [x] UserProfileView
- [x] UserProfileEditForm
- [x] UserCard
- [x] CommentItem (댓글 작성자 아바타)
- [ ] GroupCard (그룹 아바타) - 안 씀!

**판단**:
```
User 엔티티에만 사용 → entities/user/ui/user-avatar.tsx
```

**만약** GroupAvatar도 똑같은 컴포넌트를 쓴다면:
```
범용화 → shared/ui/avatar.tsx
```

---

#### 시나리오 2: ProfileImageUploader

**사용처**:
- [x] UserProfileEditForm
- [x] UserSignupForm
- [ ] GroupCreateForm - 비슷하지만 다름 (크기, 형식 다름)

**판단**:
```typescript
// entities/user/ui/profile-image-uploader.tsx
export const ProfileImageUploader = () => {
  // User 프로필 이미지 업로드 로직
  // 특정 크기/형식/저장 위치 등 User 전용
}
```

**만약** GroupImageUploader도 완전히 똑같다면:
```typescript
// shared/ui/image-uploader.tsx
type Props = {
  aspectRatio?: number;
  maxSize?: number;
  onUpload: (file: File) => void;
}
```

---

#### 시나리오 3: FormLayout vs UserFormLayout

**FormLayout (범용)**:
```typescript
// shared/ui/form-layout.tsx
// 모든 폼에서 사용 가능한 레이아웃
```

**UserFormLayout (특화)**:
```typescript
// entities/user/ui/user-form-layout.tsx
// User 폼에만 특화된 레이아웃 (예: 프로필 이미지 영역 포함)
```

**판단 기준**:
- User에만 특별한 요구사항이 있으면 → `entities/user/ui/`
- 모든 폼이 동일한 레이아웃이면 → `shared/ui/`

---

### 컴포넌트 타입별 배치

| 컴포넌트 타입 | Entity | Feature | Shared |
|-------------|--------|---------|--------|
| View | ✅ | ❌ | ❌ |
| Card | ✅ | ❌ | ⚠️ |
| Form | ❌ | ✅ | ❌ |
| Dialog | ❌ | ✅ | ❌ |
| List | ✅ | ❌ | ⚠️ |
| Button | ❌ | ⚠️ | ✅ |
| Input | ❌ | ❌ | ✅ |
| Avatar | ✅ | ❌ | ⚠️ |
| Layout | ⚠️ | ❌ | ✅ |

**범례**:
- ✅ 주로 여기
- ⚠️ 상황에 따라
- ❌ 여기 아님

---

### 체크리스트

새로운 공유 컴포넌트를 만들 때:

- [ ] 어떤 컴포넌트들이 이걸 사용하나?
- [ ] 같은 Entity 내부만 사용하나?
- [ ] 여러 Entity가 사용하나?
- [ ] 도메인 특화적인 로직이 있나?
- [ ] 범용적으로 사용 가능한가?
- [ ] 의심스러우면 Entity에 두었나? (나중에 올리기 쉬움)

---

### 핵심 기억하기

```
View와 Form이 공유
  └─ 도메인 특화적?
       ├─ YES → entities/user/ui/
       └─ NO  → shared/ui/
```

**의심스러우면**: Entity에 두세요!
- Entity → Shared 이동은 쉬움 (의존성 줄이기)
- Shared → Entity 이동은 어려움 (의존성 늘리기)

---

## 실제 사례

### 사례 1: 소셜 계정 연동

#### 현황
- 사용자 프로필 페이지에서 소셜 계정 연동 필요
- Kakao, Google, GitHub 지원

#### 분석

**Entity 측면**:
```typescript
entities/social-account/
  types.ts
  // type SocialAccount = {
  //   provider: 'kakao' | 'google' | 'github'
  //   email: string
  //   connectedAt: string
  // }

  api.ts
  // getSocialAccounts()
  // disconnectSocial()

  model.ts
  // useGetSocialAccounts()
```

**Feature 측면**:
```typescript
features/social-connect/
  ui/
    social-connect-button.tsx
    social-provider-list.tsx

  model/
    use-connect-kakao.ts
    use-connect-google.ts
    use-connect-github.ts

  config/
    providers.ts
```

#### 판단 기준

| 기준 | 분석 | 결과 |
|------|------|------|
| DB 테이블 | social_accounts 테이블 존재 | Entity 필요 |
| 사용자 행동 | "연동하기" 버튼 클릭 | Feature 필요 |
| 재사용성 | 프로필, 설정에서 사용 | 분리 권장 |
| API 경로 | `/users/{id}/social-accounts` | user 관련 |

#### 3가지 선택지

**A. 현재 패턴 유지** (추천 - 빠른 구현)
```
domain/
  user/
    social-account/           ← 서브 도메인
```
- 장점: 기존 코드와 일관성
- 단점: FSD 원칙 위배 (depth 깊음)

**B. 최상위 도메인**
```
domain/
  social-account/             ← 최상위
```
- 장점: 평탄한 구조
- 단점: 기존 `group/invitation` 리팩토링 필요

**C. Feature 분리** (추천 - 올바른 FSD)
```
entities/
  user/
  social-account/             ← 데이터

features/
  social-connect/             ← 연동 기능
```
- 장점: 완벽한 FSD
- 단점: 대규모 리팩토링

---

### 사례 2: 그룹 초대와 가입 요청

#### 현재 구조
```
domain/group/
  invitation/       # 받은 초대
  join-request/     # 보낸 신청
```

#### 왜 분리되었나?

**관점의 차이**:
- `invitation`: "나에게 온" 초대 (수신자 관점)
- `join-request`: "내가 보낸" 요청 (발신자 관점)

**API의 차이**:
```typescript
// invitation
GET /invitations              // 내가 받은 초대 목록
POST /invitations/{id}/accept // 초대 수락

// join-request
GET /join-requests            // 내가 보낸 신청 목록
POST /groups/{id}/join        // 신청 생성
```

**화면의 차이**:
- `invitation`: 알림 센터, "받은 초대" 탭
- `join-request`: "내 활동", "신청 내역" 탭

#### FSD 관점에서는?

```typescript
// Entity
entities/
  invitation/
    types.ts
    api.ts
    model.ts

// Feature
features/
  invitation-respond/         // 초대 수락/거절
    ui/invitation-card.tsx
    model/use-respond-invitation.ts

  group-join/                 // 그룹 가입 신청
    ui/join-dialog.tsx
    model/use-join-group.ts
```

---

### 사례 3: Study vs CardSets

#### 구조
```
domain/
  study/              # 내 학습 데이터 (북마크, 좋아요)
  cardsets/           # 카드셋 검색/조회
```

#### 왜 분리되었나?

**관점의 차이**:
- `cardsets`: 모든 사용자의 카드셋 (공개 데이터)
- `study`: 내 개인 학습 활동 (개인 데이터)

**API의 차이**:
```typescript
// cardsets
GET /cardsets                      // 전체 카드셋 검색
GET /cardsets/{id}                 // 특정 카드셋 조회

// study
GET /users/me/bookmarks            // 내 북마크
GET /users/me/likes                // 내 좋아요
```

**사용 화면**:
- `cardsets`: 탐색 페이지, 검색 페이지
- `study`: 마이페이지, 학습 대시보드

#### Entity vs Feature 분리

```typescript
// Entity
entities/
  cardset/
    types.ts
    api.ts
    model.ts              // useGetCardSets, useGetCardSet

// Feature
features/
  cardset-bookmark/       // 북마크 기능
    model/
      use-bookmark.ts

  cardset-like/           // 좋아요 기능
    model/
      use-like.ts

  cardset-search/         // 검색 기능
    ui/search-bar.tsx
    ui/filter-section.tsx
    model/use-search.ts
```

---

## 개선 방향

### 현재 상태 (2024-11-26)

```
domain/              # Entity + Feature 혼재
  user/
  group/
    invitation/
    join-request/
  cardsets/
  study/
  members/
  notification/
```

**문제점**:
- Entity와 Feature가 혼재
- 서브 도메인으로 인한 depth 증가 (FSD 원칙 위배)
- 재사용성 낮음

---

### 단계적 개선 방안

#### Phase 1: Features 폴더 도입 (단기)

```
domain/              # Entity만
  user/
  group/
  social-account/    # 새로 추가
  cardsets/

features/            # 새로 추가
  social-connect/
  group-join/
  invitation-respond/
```

**변경 사항**:
- `features/` 폴더 생성
- 새로운 기능은 features에 추가
- 기존 domain은 유지 (점진적 마이그레이션)

---

#### Phase 2: Entity 정리 (중기)

```
entities/            # domain → entities 리네이밍
  user/
  group/
  invitation/        # group/invitation → 최상위
  join-request/      # group/join-request → 최상위
  social-account/
  cardset/
  notification/

features/
  social-connect/
  group-create/
  group-join/
  invitation-respond/
  cardset-bookmark/
  cardset-like/
```

**변경 사항**:
- `domain/` → `entities/`로 리네이밍
- 서브 도메인을 최상위로 승격
- Entity와 Feature 명확히 분리

---

#### Phase 3: Widget 도입 (장기)

```
entities/
  user/
  group/
  social-account/

features/
  social-connect/
  profile-edit/
  group-create/

widgets/             # 새로 추가
  user-profile/      # Entity + Features 조합
  group-card/
  cardset-card/

pages/
  profile.tsx        # Widget 조합
```

**변경 사항**:
- `widgets/` 레이어 추가
- 복잡한 UI 블록을 Widget으로 분리
- Pages는 Widget 조합만

---

### 마이그레이션 가이드

#### 1. 새 기능 개발 시

```typescript
// ❌ 기존 방식
domain/user/social-account/

// ✅ 새로운 방식
entities/social-account/     // 데이터
features/social-connect/     // 기능
```

#### 2. 기존 코드 리팩토링 시

**Before**:
```typescript
domain/group/
  components/GroupForm.tsx
  hooks/useGroupDetail.ts
```

**After**:
```typescript
entities/group/
  model.ts              // useGroupDetail (조회)
  api.ts
  types.ts

features/group-create/
  ui/group-form.tsx     // GroupForm
  model/use-create-group.ts
```

#### 3. Import 경로 변경

**Before**:
```typescript
import { useGroupDetail } from '@/domain/group/hooks'
import { GroupForm } from '@/domain/group/components'
```

**After**:
```typescript
import { useGroupDetail } from '@/entities/group'
import { GroupForm } from '@/features/group-create'
```

---

### 체크리스트

새로운 기능을 추가할 때:

- [ ] 이게 Entity인가 Feature인가?
- [ ] 여러 엔티티를 조합하는가?
- [ ] 사용자 인터랙션이 핵심인가?
- [ ] 재사용 가능한가?
- [ ] 적절한 폴더에 배치했는가?

---

## 참고 자료

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [FlipNote Architecture Guide](./architecture.md)
- [Component Patterns Guide](./component-patterns.md)

---

## FAQ

### Q1. Entity와 Feature 중 어디에 둬야 할지 모르겠어요

**판단 기준**:
- "사용자가 ~하기" 형태면 → Feature
- "~데이터" 형태면 → Entity

**예시**:
- "소셜 계정 **연동하기**" → Feature
- "소셜 계정 **목록**" → Entity

---

### Q2. 서브 도메인을 만들어야 할까요?

**FSD 원칙상으로는 NO**입니다. 대신:
- 최상위 도메인으로 분리하거나
- Feature로 추출하세요

**예외**:
- 기존 코드와의 일관성을 위해 임시로 허용
- 추후 리팩토링 계획

---

### Q3. domain 폴더를 entities로 바꿔야 하나요?

**당장은 NO**입니다. 단계적으로:
1. 새 기능은 features/에 추가
2. 시간 날 때 점진적 마이그레이션
3. 팀 전체가 준비되면 리네이밍

---

### Q4. 모든 기능을 Feature로 분리해야 하나요?

**NO**입니다. 트레이드오프 고려:
- 작은 프로젝트: domain만으로도 충분
- 큰 프로젝트: Entity + Feature 분리 권장
- **FlipNote**: 중간 규모, 점진적 도입 권장

---

**Last Updated**: 2024-11-26
**Version**: 1.0.0
