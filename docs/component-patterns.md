# Component Patterns Guide

> 이 문서는 FlipNote 프론트엔드의 컴포넌트 작성 패턴과 구조화 원칙을 다룹니다.

## 목차

1. [핵심 원칙](#핵심-원칙)
2. [분리 vs 통합 판단](#분리-vs-통합-판단)
3. [폼 컴포넌트 패턴](#폼-컴포넌트-패턴)
4. [실전 예시](#실전-예시)
5. [안티패턴](#안티패턴)
6. [체크리스트](#체크리스트)

---

## 핵심 원칙

### 1. YAGNI (You Aren't Gonna Need It)

**"필요할 때 분리하자, 미리 분리하지 말자"**

```typescript
// ❌ 나쁜 예: 미리 과도하게 분리
// components/UserForm.tsx
// hooks/useUserForm.ts
// hooks/useUserValidation.ts
// hooks/useUserSubmit.ts
// utils/userFormHelpers.ts
// ... (재사용도 안 되는데 5개 파일)

// ✅ 좋은 예: 필요한 만큼만
// components/UserForm.tsx (200줄, 읽기 쉬움)
// lib/userValidation.ts (재사용되는 validation만 분리)
```

### 2. 가독성 > 형식적 분리

**"Container-Presenter 패턴이 항상 좋은 건 아니다"**

```typescript
// ❌ 형식적 분리 (오히려 복잡함)
const UserFormContainer = () => {
  const logic = useUserFormLogic();
  return <UserFormView {...logic} />;
};

// ✅ 단순하고 명확 (200줄 이하면 충분)
const UserForm = () => {
  const { register, handleSubmit } = useForm();
  const { mutate } = useMutation(...);

  const onSubmit = (data) => mutate(data);

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
};
```

### 3. 복잡도 > 줄 수

**"300줄이어도 단순하면 한 파일, 150줄이어도 복잡하면 분리"**

```typescript
// 300줄이지만 단순 반복 → 한 파일 OK
<form>
  <Input name="field1" {...register("field1")} />
  <Input name="field2" {...register("field2")} />
  // ... 반복 50개
</form>

// 150줄이지만 복잡 → 분리 고려
const onSubmit = () => {
  if (condition1 && condition2) {
    if (complexState.includes(x)) {
      // 중첩된 상태 업데이트 로직
      if (another condition) { ... }
    }
  }
  // 10개의 상태 조합...
};
```

---

## 분리 vs 통합 판단

### 판단 기준표

| 기준            | 한 파일 ✅   | 분리 고려 ⚠️       | 반드시 분리 🔴           |
| --------------- | ------------ | ------------------ | ------------------------ |
| **줄 수**       | ~300줄       | 300-500줄          | 500줄+                   |
| **상태 개수**   | ~3개         | 3-5개              | 5개+ useState/useReducer |
| **조건 분기**   | 단순 if/else | 2-3단계 중첩       | 복잡한 상태 머신         |
| **재사용**      | 1곳          | 2곳                | 3곳+                     |
| **테스트 필요** | E2E로 충분   | 비즈니스 로직 있음 | 복잡한 계산/판단 로직    |
| **변경 빈도**   | 낮음         | 보통               | 높음 (자주 수정)         |
| **스크롤**      | 1-2회        | 3-4회              | 5회+                     |
| **인지 부하**   | 낮음         | 보통               | 높음 (이해하기 어려움)   |

### 분리가 필요한 신호들

#### 🚨 즉시 분리 신호

```typescript
// 1. 스크롤 5번 이상
// 2. useState 5개 이상
const [a, setA] = useState();
const [b, setB] = useState();
const [c, setC] = useState();
const [d, setD] = useState();
const [e, setE] = useState();
const [f, setF] = useState();  // 많다!

// 3. 중첩 3단계 이상
if (condition1) {
  if (condition2) {
    if (condition3) {
      if (condition4) {  // 깊다!
        ...
      }
    }
  }
}

// 4. 같은 로직이 3곳 이상 반복
```

#### ⚠️ 분리 고려 신호

```typescript
// 1. 파일 읽는데 5분 이상 걸림
// 2. "이게 뭐하는 코드지?" 3번 이상 생각
// 3. 수정할 때 다른 부분 영향 걱정됨
```

---

## 폼 컴포넌트 패턴

### 패턴 1: 단순 폼 (권장 - 한 파일)

**조건**:

- 300줄 이하
- 단일 목적 (생성 OR 수정)
- 재사용 안 됨
- validation은 별도 파일

**구조**:

```
domain/group/
  ├── components/
  │   └── GroupCreateForm.tsx       # 250줄 (로직 + UI)
  ├── lib/
  │   └── validation.ts             # validation 로직
  └── hooks/
      └── useGroupDetail.ts         # 조회용 (생성과 무관)
```

**코드**:

```typescript
// domain/group/components/GroupCreateForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { groupCreateSchema } from "../lib/validation";

export const GroupCreateForm = () => {
  // 1. Form setup
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(groupCreateSchema),
  });

  // 2. Mutation
  const { mutate, isPending } = useMutation({
    mutationFn: groupApi.create,
    onSuccess: () => {
      toast.success("그룹 생성 완료");
      navigate("/groups");
    },
  });

  // 3. Handlers
  const onSubmit = (data: FormData) => {
    mutate(data);
  };

  // 4. UI (150줄)
  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="name">그룹명</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
        </div>

        {/* 나머지 필드들... */}

        <Button type="submit" disabled={isPending}>
          {isPending ? "생성 중..." : "생성"}
        </Button>
      </form>
    </Card>
  );
};
```

**장점**:

- ✅ 모든 맥락이 한 곳에
- ✅ 파일 왔다갔다 불필요
- ✅ 빠른 이해
- ✅ 수정 용이

---

### 패턴 2: 복잡한 폼 (분리)

**조건**:

- 500줄 이상
- 여러 단계 (multi-step)
- 복잡한 상태 관리
- 여러 곳에서 재사용

**구조**:

```
features/user-onboarding/
  ├── components/
  │   ├── OnboardingForm.tsx        # 200줄 (UI만)
  │   ├── StepIndicator.tsx
  │   └── StepContent.tsx
  └── hooks/
      └── useOnboardingFlow.ts      # 300줄 (로직만)
```

**코드**:

```typescript
// features/user-onboarding/hooks/useOnboardingFlow.ts
export const useOnboardingFlow = () => {
  // 복잡한 다단계 폼 상태 관리
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  // 단계별 validation
  const validateStep = (step: number) => { ... };

  // 다음 단계로
  const goNext = () => { ... };

  // 이전 단계로
  const goBack = () => { ... };

  // 최종 제출
  const submit = async () => { ... };

  return {
    currentStep,
    formData,
    goNext,
    goBack,
    submit,
    // ...
  };
};

// features/user-onboarding/components/OnboardingForm.tsx
export const OnboardingForm = () => {
  const flow = useOnboardingFlow();  // 훅 사용

  return (
    <div>
      <StepIndicator currentStep={flow.currentStep} />
      <StepContent step={flow.currentStep} data={flow.formData} />
      <Button onClick={flow.goNext}>다음</Button>
    </div>
  );
};
```

**분리 이유**:

- 🔴 복잡한 상태 로직 (300줄)
- 🔴 여러 컴포넌트에서 재사용
- 🔴 독립적 테스트 필요

---

### 패턴 3: 하이브리드 (권장하지 않음)

**피해야 할 패턴**:

```typescript
// ❌ Container-Presenter만을 위한 분리
// FormContainer.tsx (30줄)
const FormContainer = () => {
  const { data, onSubmit } = useFormLogic();  // 단순 전달만
  return <FormView data={data} onSubmit={onSubmit} />;
};

// FormView.tsx (200줄)
const FormView = ({ data, onSubmit }) => {
  return <form>...</form>;
};

// useFormLogic.ts (50줄)
const useFormLogic = () => {
  const { mutate } = useMutation(...);
  return { data: {}, onSubmit: mutate };
};
```

**문제**:

- 불필요한 추상화
- 파일 3개 왔다갔다
- 오히려 복잡도 증가

**대안**: 그냥 한 파일에

```typescript
// Form.tsx (280줄)
const Form = () => {
  // 로직 + UI 모두
};
```

---

## 실전 예시

### 예시 1: User 프로필 수정 (한 파일)

```typescript
// domain/user/components/UserProfileEditForm.tsx (280줄)

export const UserProfileEditForm = ({ userId }: Props) => {
  // 1. Data fetching
  const { data: user } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userApi.get(userId),
  });

  // 2. Form setup
  const { register, handleSubmit, reset, control } = useForm({
    resolver: zodResolver(userEditSchema),  // validation 분리됨
  });

  // 3. Mutation
  const { mutate, isPending } = useMutation({
    mutationFn: userApi.update,
    onSuccess: () => {
      toast.success("수정 완료");
      queryClient.invalidateQueries(["user", userId]);
    },
  });

  // 4. Effects
  useEffect(() => {
    if (user) {
      reset(user);  // 초기값 설정
    }
  }, [user, reset]);

  // 5. Handlers
  const onSubmit = (data: FormData) => {
    mutate({ userId, ...data });
  };

  // 6. UI (150줄)
  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input {...register("nickname")} />
        <Input {...register("phone")} />
        {/* ... */}
        <Button type="submit" disabled={isPending}>저장</Button>
      </form>
    </Card>
  );
};
```

**분리하지 않은 이유**:

- ✅ 280줄로 관리 가능
- ✅ 흐름이 명확 (data → form → submit → UI)
- ✅ 한 곳에서만 사용
- ✅ validation은 이미 분리됨

---

### 예시 2: 협업 카드셋 에디터 (분리)

```typescript
// features/collaborative-editor/hooks/useCollaborativeEdit.ts (300줄)

export const useCollaborativeEdit = (cardsetId: string) => {
  // WebSocket 연결
  const socket = useWebSocket(`/cardset/${cardsetId}`);

  // 실시간 동기화
  const [syncState, setSyncState] = useState({});
  const [activeUsers, setActiveUsers] = useState([]);

  // Conflict resolution
  const resolveConflict = (local, remote) => { ... };

  // 실시간 업데이트
  useEffect(() => {
    socket.on("update", (data) => {
      // 복잡한 상태 동기화 로직
    });
  }, [socket]);

  // 로컬 변경 브로드캐스트
  const broadcastChange = (change) => { ... };

  return {
    syncState,
    activeUsers,
    broadcastChange,
    // ...
  };
};

// features/collaborative-editor/components/CollaborativeEditor.tsx (250줄)

export const CollaborativeEditor = ({ cardsetId }: Props) => {
  const { syncState, activeUsers, broadcastChange } = useCollaborativeEdit(cardsetId);

  return (
    <div>
      <ActiveUsersIndicator users={activeUsers} />
      <Editor content={syncState.content} onChange={broadcastChange} />
    </div>
  );
};
```

**분리한 이유**:

- 🔴 복잡한 실시간 동기화 로직 (300줄)
- 🔴 여러 에디터 컴포넌트에서 재사용 가능
- 🔴 독립적 테스트 필요 (conflict resolution)
- 🔴 WebSocket 로직과 UI 명확히 분리

---

### 예시 3: 그룹 검색 필터 (한 파일)

```typescript
// domain/group/components/GroupSearchFilters.tsx (200줄)

export const GroupSearchFilters = ({ onFilterChange }: Props) => {
  // 로컬 상태
  const [category, setCategory] = useState<Category>();
  const [sortBy, setSortBy] = useState("createdAt");

  // Debounced callback
  const debouncedOnChange = useMemo(
    () => debounce((filters) => onFilterChange(filters), 300),
    [onFilterChange]
  );

  // 필터 변경 시 부모에게 알림
  useEffect(() => {
    debouncedOnChange({ category, sortBy });
  }, [category, sortBy, debouncedOnChange]);

  return (
    <div>
      <CategorySelect value={category} onChange={setCategory} />
      <SortSelect value={sortBy} onChange={setSortBy} />
    </div>
  );
};
```

**분리하지 않은 이유**:

- ✅ 200줄로 충분히 관리 가능
- ✅ 단순한 로컬 상태
- ✅ 로직이 UI와 밀접

---

## 안티패턴

### ❌ 안티패턴 1: 과도한 추상화

```typescript
// 나쁜 예: 불필요한 레이어
// FormContainer.tsx
const FormContainer = () => {
  const logic = useFormLogic();
  return <FormPresenter {...logic} />;
};

// FormPresenter.tsx
const FormPresenter = (props) => {
  return <FormView {...props} />;
};

// FormView.tsx
const FormView = (props) => {
  return <form>...</form>;
};

// 총 4개 파일, 실제 로직은 50줄
```

**해결**: 그냥 한 파일

```typescript
// Form.tsx (1개 파일, 200줄)
const Form = () => {
  // 로직 + UI
};
```

---

### ❌ 안티패턴 2: 재사용 없는 hook 분리

```typescript
// 나쁜 예
// hooks/useUserFormLogic.ts (1곳에서만 사용)
export const useUserFormLogic = () => {
  const { mutate } = useMutation(...);
  return { onSubmit: mutate };
};

// components/UserForm.tsx
const UserForm = () => {
  const { onSubmit } = useUserFormLogic();
  return <form onSubmit={onSubmit}>...</form>;
};
```

**해결**: 컴포넌트 내부에

```typescript
// components/UserForm.tsx
const UserForm = () => {
  const { mutate } = useMutation(...);
  return <form onSubmit={mutate}>...</form>;
};
```

---

### ❌ 안티패턴 3: toast/redirect 때문에 분리

```typescript
// 나쁜 예
// hooks/useCreateGroup.ts
export const useCreateGroup = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const { mutate } = useMutation({
    mutationFn: groupApi.create,
    onSuccess: () => {
      toast.success("생성 완료");
      navigate("/groups");
    },
  });

  return { create: mutate };
};
```

**문제**: toast/navigate는 테스트 시 mock 가능. 분리 불필요.

**해결**: 컴포넌트 내부에

```typescript
const GroupForm = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const { mutate } = useMutation({
    mutationFn: groupApi.create,
    onSuccess: () => {
      toast.success("생성 완료");
      navigate("/groups");
    },
  });

  return <form onSubmit={mutate}>...</form>;
};
```

---

### ❌ 안티패턴 4: 도메인 로직을 컴포넌트에

```typescript
// 나쁜 예
const UserForm = () => {
  const validate = (data) => {
    // 50줄의 복잡한 validation 로직
    if (data.email.includes("@")) { ... }
    if (data.password.length > 8) { ... }
    // ...
  };
};
```

**해결**: 도메인 로직은 분리

```typescript
// domain/user/lib/validation.ts
export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// components/UserForm.tsx
const UserForm = () => {
  const { register } = useForm({
    resolver: zodResolver(userSchema), // 분리된 validation 사용
  });
};
```

---

### ❌ 안티패턴 5: 실제 사례 - 2,022줄 Container 컴포넌트

**실제 프로덕션 코드에서 발견된 Container-Presenter 패턴의 실패 사례입니다.**

#### 파일 개요
```
broadcastCreate.container.tsx - 2,022줄
```

#### 문제점 요약

| 지표 | 수치 | 권장 기준 | 상태 |
|------|------|----------|------|
| **총 줄 수** | 2,022줄 | 300줄 이하 | 🔴 6.7배 초과 |
| **useState 개수** | 17개 | 3개 이하 | 🔴 5.6배 초과 |
| **useEffect 개수** | 9개 | 2-3개 | 🔴 3배 초과 |
| **Handler 함수** | 40+개 | 10개 이하 | 🔴 4배 초과 |
| **Props 전달** | 30+개 | 5개 이하 | 🔴 6배 초과 |

#### 구체적 문제들

##### 1. 거대한 데이터 변환 함수 (130줄, 36개 의존성)

```typescript
// ❌ 문제: generateSubmitData - 130줄, 36개 의존성
const generateSubmitData = useCallback(
  (datas?: BROADCAST_PAYLOAD) => {
    const formData = datas ?? getValues();

    const broadcastData: any = {
      clientId: client.value === "select" ? undefined : client.value,
      managerId: manager.value === "select" ? undefined : manager.value,
      operatorId: operator.value === "select" ? undefined : operator.value,
      signed: isSigned === "true" ? true : false,
      form: formData.form,
      type: formData.type,
      tags,
      meta: {
        exposureStartTime: formData.meta.exposureStartTime,
        exposureEndTime: formData.meta.exposureEndTime,
        name: broadcastName,
        scheduledStartTime: isNow === "true"
          ? Number(new Date(formData.meta.scheduledStartTime).toISOString().split("-")[0]) + 1 + "-" + ...
          : formData.meta.scheduledStartTime,
        // ... 100줄 더
      },
      // ... 많은 중첩 객체들
    };

    return broadcastData;
  },
  [
    // 36개의 의존성들
    isUpdate, basicImage, benefitData.desc, benefitData.title,
    benefitData.images, broadcastName, client.value, coupons,
    curations, externalRTMP, faqs, getValues, images, inflowData,
    isNow, isSigned, manager.value, adminNotice.message,
    adminNotice.name, adminNotice.use, operator.value, products,
    rehearsalJoinCode, tags, templateType.value, useCoupon,
    useExternalRTMP, useFaq, useView, isPlayerView,
    currentBroadcast, enableVertical, isUserAccessEnabled,
    isProductRolling, benefitFlagData
  ]
);
```

**문제점**:
- 의존성 36개로 인해 불필요한 리렌더링 폭발
- 데이터 변환 로직이 UI 컴포넌트에 결합
- 테스트 불가능 (36개 의존성 모두 모킹 필요)
- 함수 변경 시 전체 컴포넌트 영향

##### 2. 거대한 제출 함수 (270줄, 27개 의존성)

```typescript
// ❌ 문제: handleCreateBroadcast - 270줄, 27개 의존성
const handleCreateBroadcast = useCallback(
  async (formData: BROADCAST_PAYLOAD) => {
    const broadcastData: any = generateSubmitData(formData);
    const validationData = generateValidateData(formData, broadcastData);

    const errors = broadcastValidation({ ...validationData, useInflow });

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      // ... 20줄의 에러 처리
      return;
    }

    const bffError = validatorBenefitFlag(benefitFlagData);
    setBenefitFlagError(bffError);

    if (bffError) {
      if (bffError.enabled) {
        action.SET_TOAST({
          message: bffError.enabled,
          type: "error"
        });
      }
      return;
    }

    if (!currentBroadcast?.signed && isSigned === "true" &&
        (new Date() > new Date(getValues("meta.scheduledStartTime")) ||
         "01:00:50" > UTIL.timeDiff(new Date().toString(), getValues("meta.scheduledStartTime")))) {
      action.SET_TOAST({
        message: "방송 시작 1시간 이전까지만 승인 가능합니다.",
        type: "warning"
      });
      // ... 200줄 더 계속...
    }

    // ... 수많은 조건문과 분기들
  },
  [
    // 27개의 의존성들
    generateSubmitData, generateValidateData, useInflow,
    currentBroadcast, isSigned, getValues, action,
    operator.value, basicImage, additionalImage,
    templateType.value, images, vodIdPrevForm, benefitData,
    useBenefit, navigate, isUpdate, curations, client.value,
    isNow, faqs.length, useExposureTime, customButtonData,
    benefitFlagData, setBenefitFlagError, validatorBenefitFlag
  ]
);
```

**문제점**:
- 270줄의 단일 함수 (읽기 불가능)
- validation, 비즈니스 로직, API 호출, 에러 처리가 모두 한 곳에
- 중첩된 조건문 5단계 이상
- 27개 의존성으로 디버깅 악몽

##### 3. 상태 폭발과 Props Drilling

```typescript
// ❌ 17개의 useState
const [client, setClient] = useState(...);
const [manager, setManager] = useState(...);
const [operator, setOperator] = useState(...);
const [isSigned, setIsSigned] = useState(...);
const [tags, setTags] = useState(...);
const [products, setProducts] = useState(...);
const [coupons, setCoupons] = useState(...);
const [faqs, setFaqs] = useState(...);
const [images, setImages] = useState(...);
const [benefitData, setBenefitData] = useState(...);
const [benefitFlagData, setBenefitFlagData] = useState(...);
const [customButtonData, setCustomButtonData] = useState(...);
const [inflowData, setInflowData] = useState(...);
const [externalRTMP, setExternalRTMP] = useState(...);
const [curations, setCurations] = useState(...);
const [errors, setErrors] = useState({});
const [vodIdPrevForm, setVodIdPrevForm] = useState(...);
// ... 더 있음

// ❌ 30+개 props를 자식에게 전달
return (
  <>
    <BroadcastBasicForm
      client={client}
      setClient={setClient}
      manager={manager}
      setManager={setManager}
      operator={operator}
      setOperator={setOperator}
      isSigned={isSigned}
      setIsSigned={setIsSigned}
      tags={tags}
      setTags={setTags}
      errors={errors}
      // ... 20개 props 더
    />
    <BroadcastProductForm
      products={products}
      setProducts={setProducts}
      handleClickProductAdd={handleClickProductAdd}
      handleClickProductLoad={handleClickProductLoad}
      handleLoadProduct={handleLoadProduct}
      handleChangeProducts={handleChangeProducts}
      handleDisplayProducts={handleDisplayProducts}
      handleToggleDisplayAll={handleToggleDisplayAll}
      // ... 15개 props 더
    />
    {/* 10개 이상의 Form 컴포넌트들... */}
  </>
);
```

**문제점**:
- 17개 useState로 상태 추적 불가
- 30+개 props를 자식에게 전달 (props drilling 지옥)
- 상태 간 의존성 파악 불가능
- 어떤 상태 변경이 어떤 리렌더링을 유발하는지 알 수 없음

#### 왜 Container-Presenter 패턴이 실패했는가?

Container-Presenter 패턴을 적용했지만 다음과 같은 이유로 실패했습니다:

1. **단일 Container에 모든 로직 집중**
   - 10개 이상의 Form을 하나의 Container가 관리
   - 각 Form의 상태, 핸들러, validation이 모두 Container에
   - Container가 "God Object"가 됨

2. **Presenter가 dumb component가 아님**
   - Presenter들이 복잡한 UI 로직 포함
   - Container에서 받은 props를 또 다른 자식에게 전달
   - 실제로는 또 다른 Container처럼 동작

3. **도메인 로직이 분리되지 않음**
   - validation 로직이 컴포넌트 내부에
   - 데이터 변환 로직이 useCallback으로 컴포넌트에 결합
   - 비즈니스 규칙이 컴포넌트 곳곳에 산재

4. **잘못된 추상화**
   - 관심사 분리 실패 (UI/비즈니스/API가 혼재)
   - 재사용 불가능 (너무 특정 케이스에 결합됨)
   - 테스트 불가능 (의존성이 너무 많음)

#### 올바른 리팩토링 방향

```typescript
// ✅ 1단계: 섹션별로 분리 (Feature-based)
features/broadcast-create/
  ├── components/
  │   ├── BroadcastCreatePage.tsx          # 100줄 (레이아웃 조합만)
  │   ├── BasicInfoSection.tsx             # 150줄
  │   ├── ProductSection.tsx               # 200줄
  │   ├── BenefitSection.tsx               # 180줄
  │   ├── ScheduleSection.tsx              # 120줄
  │   └── AdvancedSection.tsx              # 150줄
  ├── hooks/
  │   ├── useBroadcastCreate.ts            # 주요 생성 로직만
  │   ├── useProductManagement.ts          # 상품 관리 로직만
  │   └── useBenefitSettings.ts            # 혜택 설정 로직만
  └── lib/
      ├── validation.ts                    # 모든 validation 규칙
      ├── dataTransform.ts                 # generateSubmitData 분리
      └── businessRules.ts                 # 비즈니스 규칙들

// ✅ 2단계: 상태 관리 분리
// Zustand나 React Query로 서버 상태 분리
// Form 상태는 react-hook-form으로 관리
// UI 상태만 로컬 useState로

// ✅ 3단계: 각 섹션을 독립적으로
// BroadcastCreatePage.tsx (100줄)
const BroadcastCreatePage = () => {
  const { handleSubmit } = useBroadcastCreate();

  return (
    <form onSubmit={handleSubmit}>
      <BasicInfoSection />      {/* 독립적 */}
      <ProductSection />        {/* 독립적 */}
      <BenefitSection />        {/* 독립적 */}
      <ScheduleSection />       {/* 독립적 */}
      <AdvancedSection />       {/* 독립적 */}
    </form>
  );
};

// ProductSection.tsx (200줄)
const ProductSection = () => {
  // 이 섹션만의 상태와 로직
  const { products, addProduct, removeProduct } = useProductManagement();

  return (
    <section>
      <ProductList products={products} />
      <ProductAddButton onClick={addProduct} />
    </section>
  );
};

// ✅ 4단계: 도메인 로직 완전 분리
// lib/dataTransform.ts
export const generateBroadcastSubmitData = (
  formData: FormData,
  options: TransformOptions
): BroadcastPayload => {
  // 순수 함수로 분리 - 의존성 0
  return {
    clientId: formData.client !== "select" ? formData.client : undefined,
    managerId: formData.manager !== "select" ? formData.manager : undefined,
    // ...
  };
};

// lib/validation.ts
export const broadcastSchema = z.object({
  client: z.string().refine(v => v !== "select", "클라이언트를 선택해주세요"),
  scheduledStartTime: z.date()
    .refine(date => date > new Date(), "미래 시간을 선택해주세요"),
  // ... 모든 validation 규칙
});
```

#### 리팩토링 효과

| 항목 | Before | After | 개선 |
|------|--------|-------|------|
| **파일 크기** | 2,022줄 | 100-200줄 | ✅ 10배 감소 |
| **useState** | 17개 (한 파일) | 2-3개 (파일당) | ✅ 5배 감소 |
| **의존성** | 36개 | 0개 (순수함수) | ✅ 완전 제거 |
| **Props** | 30+개 | 5개 이하 | ✅ 6배 감소 |
| **테스트** | 불가능 | 각 파일 독립 테스트 | ✅ 가능 |
| **재사용** | 불가능 | 섹션별 재사용 가능 | ✅ 가능 |
| **유지보수** | 악몽 | 섹션별 수정 | ✅ 쉬움 |

#### 핵심 교훈

1. **Container-Presenter는 만능이 아니다**
   - 단순히 UI와 로직을 분리한다고 좋은 구조가 아님
   - 오히려 잘못 적용하면 더 복잡해짐

2. **섹션 기반으로 나눠라**
   - 하나의 거대한 Form이 아니라
   - 독립적인 섹션들의 조합으로

3. **도메인 로직은 항상 분리**
   - validation, transformation, business rules
   - 컴포넌트가 아닌 lib/에

4. **상태 관리 전략을 먼저 세워라**
   - 서버 상태: React Query
   - Form 상태: react-hook-form
   - UI 상태: 로컬 useState
   - 글로벌 UI: Zustand

5. **라인 수는 증상일 뿐, 근본 원인이 아니다**
   - 2,022줄은 결과
   - 진짜 문제는 잘못된 관심사 분리

---

## 테스트 전략

### 패턴 1: 한 파일 컴포넌트 테스트

```typescript
// GroupCreateForm.test.tsx
describe("GroupCreateForm", () => {
  it("폼 제출 시 API 호출", async () => {
    const mockCreate = jest.fn();
    jest.spyOn(groupApi, "create").mockImplementation(mockCreate);

    render(<GroupCreateForm />);

    fireEvent.change(screen.getByLabelText("그룹명"), { target: { value: "테스트" } });
    fireEvent.click(screen.getByText("생성"));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({ name: "테스트" });
    });
  });
});
```

**충분함**: toast, navigate는 mock으로 처리

---

### 패턴 2: 분리된 hook 테스트

```typescript
// useCollaborativeEdit.test.ts
describe("useCollaborativeEdit", () => {
  it("conflict 발생 시 최신 데이터 우선", () => {
    const { result } = renderHook(() => useCollaborativeEdit("1"));

    act(() => {
      result.current.resolveConflict(localData, remoteData);
    });

    expect(result.current.syncState).toBe(remoteData);
  });
});
```

**필요함**: 복잡한 비즈니스 로직 독립 테스트

---

## 점진적 리팩토링 가이드

### 1단계: 한 파일로 시작

```typescript
// ✅ 처음 작성 (150줄)
const Form = () => {
  // 간단한 로직
  return <form>...</form>;
};
```

### 2단계: 복잡해지면 validation 분리

```typescript
// lib/validation.ts
export const schema = z.object({ ... });

// Form.tsx (200줄)
const Form = () => {
  const { register } = useForm({ resolver: zodResolver(schema) });
  return <form>...</form>;
};
```

### 3단계: 더 복잡해지면 helper 분리

```typescript
// lib/helpers.ts
export const formatData = (raw) => { ... };

// Form.tsx (280줄)
const Form = () => {
  const formatted = formatData(rawData);
  return <form>...</form>;
};
```

### 4단계: 한계 도달 시 hook 분리

```typescript
// hooks/useFormLogic.ts (200줄)
export const useFormLogic = () => { ... };

// Form.tsx (150줄)
const Form = () => {
  const logic = useFormLogic();
  return <form>...</form>;
};
```

**핵심**: 단계적으로, 필요할 때만

---

## 팀 컨벤션

### 우리 팀 기준

✅ **기본: 한 파일 작성**

- 300줄 이하
- 단일 목적
- 재사용 안 됨

✅ **분리 고려 시점**

- 스크롤 5번 이상
- useState 5개 이상
- 중첩 조건문 3단계 이상
- 2곳 이상 재사용

✅ **무조건 분리**

- validation/helpers → lib/
- API 호출 → shared/apis/
- 타입 정의 → types.ts

❌ **분리하지 말 것**

- toast/navigate만 있는 hook
- Container-Presenter만을 위한 분리
- 재사용 없는 단순 로직

---

## 체크리스트

### ✅ 새 컴포넌트 작성 시

- [ ] 먼저 한 파일에 작성
- [ ] validation은 lib/에 분리
- [ ] 300줄 넘으면 분리 고려
- [ ] 재사용 여부 확인
- [ ] 복잡도 체크 (상태, 조건, 스크롤)

### ✅ 리팩토링 고려 시

- [ ] 스크롤 5번 이상?
- [ ] useState 5개 이상?
- [ ] 이해하는데 5분 이상?
- [ ] 2곳 이상 재사용?
- [ ] 복잡한 비즈니스 로직?

### ✅ 코드 리뷰 시

- [ ] 불필요한 추상화 없는지?
- [ ] Container-Presenter 강제 아닌지?
- [ ] validation/helper 분리됐는지?
- [ ] 읽기 쉬운지?

---

## 결론

1. **기본은 한 파일**: 300줄 이하, 단순 목적
2. **필요할 때만 분리**: 재사용, 복잡도, 테스트
3. **도메인 로직은 항상 분리**: validation, helpers, utils
4. **형식보다 가독성**: Container-Presenter 강제 금지
5. **YAGNI 원칙**: 미리 분리하지 말 것

---

## 참고 자료

- [React Hook Form Best Practices](https://react-hook-form.com/advanced-usage)
- [Kent C. Dodds - AHA Programming](https://kentcdodds.com/blog/aha-programming)
- [Dan Abramov - Writing Resilient Components](https://overreacted.io/writing-resilient-components/)

---

**Last Updated**: 2025-01-28
**Contributors**: Development Team
