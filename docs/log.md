# 개선 작업 로그

> 코드 리뷰 및 개선 작업 내역을 기록합니다.

## 2025-01-29

### React Query queryFn 분기 문제

**질문 시각**: 2025-01-29

**질문 내용**:

```typescript
const { data: userInfo, isLoading } = useQuery({
  queryKey: ["userInfo", userId, isOwner],
  queryFn: async () => {
    if (isOwner) {
      const response = await userApi.getMyInfo();
      return response.data.data;
    } else {
      const response = await userApi.getUserInfo(Number(userId));
      return response.data.data;
    }
  },
});
```

> "이게 일반적인가? 나는 queryFn이 최대한 분기가 되면 안된다고 생각했거든"

**문제점**:

1. **queryKey와 queryFn 불일치**
   - isOwner가 true일 때는 userId를 사용하지 않는데 queryKey에는 포함됨
   - getMyInfo()는 현재 로그인 유저 정보 (userId 불필요)
   - getUserInfo(userId)는 특정 유저 정보 (userId 필요)

2. **타입 안정성 문제**
   - getMyInfo(): `MyInfoResponse` (email 포함)
   - getUserInfo(): `UserInfoResponse` (email 미포함)
   - 두 API의 응답 타입이 다른데 하나의 변수로 처리

3. **캐싱 혼란**
   - 같은 userId에 대해 isOwner 값에 따라 다른 데이터를 캐싱
   - React Query DevTools에서 구분이 어려움

4. **디버깅 어려움**
   - 하나의 쿼리에서 조건부로 다른 API 호출
   - 어떤 API가 실패했는지 추적하기 어려움

**개선 방법**:

```typescript
// ✅ 개선: 두 개의 독립적인 쿼리로 분리

// 본인 정보 조회
const { data: myInfo, isLoading: isLoadingMyInfo } = useQuery({
  queryKey: ["myInfo"],
  queryFn: async () => {
    const response = await userApi.getMyInfo();
    return response.data.data;
  },
  enabled: isOwner, // 본인일 때만 실행
});

// 타인 정보 조회
const { data: otherUserInfo, isLoading: isLoadingOtherUser } = useQuery({
  queryKey: ["userInfo", userId],
  queryFn: async () => {
    const response = await userApi.getUserInfo(Number(userId));
    return response.data.data;
  },
  enabled: !isOwner, // 타인일 때만 실행
});

const userInfo = isOwner ? myInfo : otherUserInfo;
const isLoading = isOwner ? isLoadingMyInfo : isLoadingOtherUser;
```

**개선 효과**:

| 항목                | Before                             | After                           |
| ------------------- | ---------------------------------- | ------------------------------- |
| **queryKey 일치성** | ❌ 불일치 (userId 불필요한데 포함) | ✅ 일치                         |
| **타입 안정성**     | ❌ 타입 혼재                       | ✅ 명확히 분리                  |
| **캐싱 전략**       | ❌ 애매함                          | ✅ 명확 (myInfo, userInfo 분리) |
| **불필요한 요청**   | ⚠️ 조건부 실행                     | ✅ enabled로 방지               |
| **DevTools 가독성** | ❌ 하나의 쿼리에 혼재              | ✅ 두 쿼리 명확히 구분          |
| **디버깅**          | ❌ 어려움                          | ✅ 쉬움                         |

**Best Practice**:

- ✅ queryFn은 가능한 단순하고 분기 없이 작성
- ✅ queryKey와 queryFn은 정확히 일치해야 함
- ✅ 다른 API는 다른 쿼리로 분리
- ✅ enabled 옵션으로 조건부 실행 제어

**수정 파일**:

- `/src/pages/user/info.tsx`

**참고**:

- [TanStack Query - Dependent Queries](https://tanstack.com/query/latest/docs/react/guides/dependent-queries)
- [TanStack Query Best Practices](https://tkdodo.eu/blog/effective-react-query-keys)

---

### 조건부 로직이 많은 페이지 컴포넌트 분리

**질문 시각**: 2025-01-29

**질문 내용**:

> "이것도 맘에 안드는게. 흠, 이럴거면 Owner일 때의 컴포넌트/Owner아닐 때 컴포넌트 나눠서 데이터 페칭도 그 안에서 하는게 낫지 않나?"

**문제점**:

```typescript
// ❌ 문제: 하나의 컴포넌트에 두 개의 완전히 다른 페이지 로직
const UserInfoPage = ({ userId }: Props) => {
  const isOwner = ...;

  // 두 개의 다른 쿼리 (하나는 항상 disabled)
  const { data: myInfo } = useQuery({ ..., enabled: isOwner });
  const { data: otherUserInfo } = useQuery({ ..., enabled: !isOwner });

  // 본인일 때만 필요한 수정 기능 (타인일 때도 항상 실행)
  const { isEditing, ... } = useUserInfoEdit(userId);

  // 3곳의 조건부 렌더링
  if (!isOwner) return <OtherUserProfile />;
  if (isEditing) return <UserProfileEditForm />;
  return <UserProfileView />;
};
```

1. **불필요한 hook 실행**
   - `useUserInfoEdit`은 본인일 때만 필요한데 항상 실행됨
   - 타인 프로필을 볼 때도 수정 관련 로직이 메모리에 로드됨

2. **항상 1개의 disabled 쿼리 존재**
   - 두 쿼리 중 하나는 항상 `enabled: false`
   - React Query가 불필요한 쿼리 객체를 관리

3. **조건부 로직 과다**
   - `isOwner` 기반 조건문이 5곳 (쿼리 2개 + 렌더링 3곳)
   - 코드 흐름 추적이 어려움

4. **책임 분리 실패**
   - 하나의 컴포넌트가 "본인 프로필 조회/수정"과 "타인 프로필 조회" 두 가지 책임
   - SRP(Single Responsibility Principle) 위반

**개선 방법**:

```typescript
// ✅ 1. info.tsx - 라우터 역할만
const UserInfoPage = ({ userId }: Props) => {
  const currentUser = useAuthStore((state) => state.user);
  const isOwner = currentUser?.userId === Number(userId);

  return isOwner
    ? <MyUserProfilePage />
    : <OtherUserProfilePage userId={userId} />;
};

// ✅ 2. my-profile.tsx - 본인 프로필 (독립적)
const MyUserProfilePage = () => {
  // 본인 정보만 조회 (enabled 불필요)
  const { data: myInfo, isLoading } = useQuery({
    queryKey: ["myInfo"],
    queryFn: async () => {
      const response = await userApi.getMyInfo();
      return response.data.data;
    },
  });

  // 수정 기능 (본인만 필요 - 이 페이지에서만 실행)
  const { isEditing, ... } = useUserInfoEdit();

  if (isLoading) return <LoadingView />;
  if (!myInfo) return <NotFoundView />;
  if (isEditing) return <UserProfileEditForm ... />;
  return <UserProfileView ... />;
};

// ✅ 3. other-profile.tsx - 타인 프로필 (독립적)
const OtherUserProfilePage = ({ userId }: { userId: string }) => {
  // 타인 정보만 조회 (enabled 불필요)
  const { data: userInfo, isLoading } = useQuery({
    queryKey: ["userInfo", userId],
    queryFn: async () => {
      const response = await userApi.getUserInfo(Number(userId));
      return response.data.data;
    },
  });

  if (isLoading) return <LoadingView />;
  if (!userInfo) return <NotFoundView />;
  return <OtherUserProfile userInfo={userInfo} />;
};
```

**개선 효과**:

| 항목              | Before                    | After                            |
| ----------------- | ------------------------- | -------------------------------- |
| **조건부 로직**   | 5곳 (쿼리 2 + 렌더링 3)   | 1곳 (라우팅만)                   |
| **불필요한 hook** | useUserInfoEdit 항상 실행 | 필요한 페이지만                  |
| **disabled 쿼리** | 항상 1개 disabled         | 없음 (각 페이지가 필요한 쿼리만) |
| **enabled 옵션**  | 2곳 필요                  | 0곳 (불필요)                     |
| **책임**          | ❌ 2가지 (본인/타인)      | ✅ 각 1가지                      |
| **코드 이해**     | ❌ 조건 추적 필요         | ✅ 각 파일 단순                  |
| **재사용성**      | ❌ 없음                   | ✅ 독립적 사용 가능              |
| **파일 크기**     | 100줄                     | info: 13줄, 나머지: 50줄         |

**추가 개선**:

`useUserInfoEdit` hook도 수정:

```typescript
// Before
export const useUserInfoEdit = (userId: string) => {
  // ...
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["userInfo", userId] });
  };
};

// After: userId 파라미터 제거
export const useUserInfoEdit = () => {
  // ...
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["myInfo"] }); // 본인 정보만 갱신
  };
};
```

**Best Practice**:

- ✅ **하나의 컴포넌트는 하나의 책임** (SRP)
- ✅ **조건부 렌더링이 많으면 컴포넌트 분리 고려**
- ✅ **페이지 수준에서는 라우팅만, 실제 로직은 각 페이지에**
- ✅ **enabled 옵션은 최소화** (분리로 해결 가능하면 분리)
- ✅ **hook도 필요한 곳에서만 실행**

**수정 파일**:

- `/src/pages/user/info.tsx` (13줄로 축소 - 라우터 역할만)
- `/src/pages/user/my-profile.tsx` (신규 - 본인 프로필)
- `/src/pages/user/other-profile.tsx` (신규 - 타인 프로필)
- `/src/features/user-info-management/hooks/useUserInfoEdit.ts` (userId 파라미터 제거)

**참고**:

- [React - Thinking in React](https://react.dev/learn/thinking-in-react)
- [Single Responsibility Principle in React](https://www.developerway.com/posts/how-to-write-resilient-react-components#part3-single-responsibility-principle)

---
