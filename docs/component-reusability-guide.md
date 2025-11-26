# 컴포넌트 재사용성 가이드

> FSD 아키텍처에서 컴포넌트를 언제 공통화하고, 언제 독립적으로 유지해야 하는지에 대한 가이드

## 목차
1. [핵심 원칙](#핵심-원칙)
2. [공통화 판단 기준](#공통화-판단-기준)
3. [Authentication 케이스 스터디](#authentication-케이스-스터디)
4. [실전 예시](#실전-예시)
5. [안티패턴](#안티패턴)

---

## 핵심 원칙

### "Duplication over Wrong Abstraction"

> **"Duplication is far cheaper than the wrong abstraction."** — Sandi Metz

코드를 복사하는 것이, 잘못된 추상화로 복잡도를 증가시키는 것보다 낫습니다.

### FSD의 독립성 원칙

```
✅ Feature는 독립적이어야 한다
✅ Feature 간 의존성을 만들지 않는다
✅ 비슷한 코드라도 기능이 다르면 복사한다
```

### YAGNI (You Aren't Gonna Need It)

지금 당장 필요하지 않은 추상화는 하지 않습니다.
미래를 위한 over-engineering을 피합니다.

---

## 공통화 판단 기준

### 판단 플로우

```
코드가 비슷하다
  ↓
질문 1: "기능적으로 완전히 동일한가?"
  YES → 공통 컴포넌트로 추출
  NO  ↓

질문 2: "미래에 다르게 변경될 가능성이 있나?"
  YES → 복사해서 독립 유지
  NO  ↓

질문 3: "공통 컴포넌트가 props 폭발을 일으키나?"
  YES → 복사해서 독립 유지
  NO  → 공통 컴포넌트 고려

질문 4: "3번 이상 동일하게 반복되나?"
  NO  → 복사 (Rule of Three)
  YES → 공통 컴포넌트 고려
```

### Rule of Three

```
1번 반복: 복사
2번 반복: 복사 (아직 패턴이 명확하지 않음)
3번 반복: 이제 추상화를 고려
```

---

## 공통화해야 하는 경우 vs 하지 말아야 하는 경우

### ✅ 공통화해야 하는 경우

#### 1. 정말 "동일한" 기능

```tsx
// ✅ shared/ui/PasswordInput.tsx
// 모든 곳에서 동일하게 비밀번호 표시/숨김 토글
export const PasswordInput = ({ ...props }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        {...props}
      />
      <Button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-2"
      >
        {showPassword ? '🙈' : '👁️'}
      </Button>
    </div>
  )
}
```

**사용처**: Login, Signup, ResetPassword, ChangePassword
**이유**: 모든 곳에서 **완전히 동일한 방식**으로 동작

---

#### 2. 디자인 시스템 수준의 UI 패턴

```tsx
// ✅ shared/ui/form/FormField.tsx
// 앱 전체에서 사용하는 시각적 패턴
export const FormField = ({
  label,
  error,
  required,
  children
}: FormFieldProps) => (
  <div className="space-y-2">
    <Label>
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
    {error && (
      <span className="text-sm text-red-500">{error}</span>
    )}
  </div>
)
```

**사용처**: 모든 Form
**이유**: 일관된 **시각적 레이아웃**을 유지

---

#### 3. 3번 이상 정확히 동일하게 반복

```tsx
// ✅ shared/ui/EmptyState.tsx
// 여러 페이지에서 동일한 빈 상태 표시
export const EmptyState = ({
  icon,
  title,
  description
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
)
```

**사용처**: CardsetList, GroupList, NotificationList 등
**이유**: **정확히 동일한 패턴**이 3곳 이상에서 반복

---

### ❌ 공통화하지 말아야 하는 경우

#### 1. 비슷해 보이지만 기능이 다른 경우

```tsx
// ❌ 잘못된 추상화
// shared/ui/EmailInput.tsx
export const EmailInput = ({
  withVerification,  // props 폭발 시작
  onSendCode,
  onVerifyCode,
  disabled,
  verified,
  ...props
}) => {
  if (withVerification) {
    // 복잡한 인증 로직
    return (
      <>
        <Input disabled={verified} {...props} />
        <Button onClick={onSendCode}>인증코드받기</Button>
        {/* 더 많은 조건부 렌더링... */}
      </>
    )
  }

  return <Input {...props} />
}
```

**문제점**:
- Props 폭발
- 조건부 로직 복잡
- Login 수정 시 Register 영향
- 테스트 어려움

---

#### 2. 서로 다른 Feature의 컴포넌트

```tsx
// ❌ 나쁜 예
// entities/user/ui/EmailField.tsx
// Login과 Register 모두에서 사용

// ✅ 좋은 예
// features/auth-login/ui/LoginForm.tsx
<Input type="email" {...register("email")} />

// features/auth-signup/ui/SignupForm.tsx
<Input
  type="email"
  disabled={isVerified}
  {...register("email")}
/>
<Button onClick={handleSendCode}>인증코드받기</Button>
```

**이유**:
- Login과 Signup은 **다른 기능**
- 미래에 다르게 변경될 가능성 높음
- 독립성 유지가 더 중요

---

#### 3. 미래에 다르게 변할 가능성이 있는 경우

```tsx
// ❌ 미래에 문제될 추상화
// shared/ui/AuthButton.tsx
export const AuthButton = ({ type, ...props }) => {
  if (type === 'login') return <Button>로그인</Button>
  if (type === 'signup') return <Button>회원가입</Button>
  if (type === 'oauth') return <Button>OAuth 로그인</Button>
  // 계속 늘어남...
}

// ✅ 각자 독립적으로
// features/auth-login/ui/LoginButton.tsx
export const LoginButton = () => <Button>로그인</Button>

// features/auth-signup/ui/SignupButton.tsx
export const SignupButton = () => <Button>회원가입</Button>
```

**이유**:
- 각 버튼이 미래에 다른 스타일/동작을 가질 수 있음
- OAuth 추가 시 Login/Signup에 영향 없어야 함

---

## Authentication 케이스 스터디

### FlipNote의 Login vs Register

#### Login 페이지
```tsx
// 단순한 이메일 + 비밀번호
<div className="space-y-2">
  <Label htmlFor="email">이메일</Label>
  <Input id="email" {...register("email")} />
</div>
<div className="space-y-2">
  <Label htmlFor="password">비밀번호</Label>
  <Input type="password" id="password" {...register("password")} />
</div>
```

#### Register 페이지
```tsx
// 이메일 + 인증 + 비밀번호 확인 + 추가 정보
<div className="space-y-2">
  <Label htmlFor="email">이메일</Label>
  <Input
    id="email"
    type="email"
    autoComplete="off"
    disabled={activateEmailVerificationField}
    {...register("email")}
  />
  <Button onClick={handleClickGetVerifyEmailCode}>
    인증코드받기
  </Button>
  {activateEmailVerificationField && (
    <>
      <Input placeholder="인증코드" {...register("emailVerifyCode")} />
      <Button onClick={handleClickVerifyEmail}>제출하기</Button>
    </>
  )}
</div>
<div className="space-y-2">
  <Label htmlFor="password">비밀번호</Label>
  <Input type="password" {...register("password")} />
</div>
<div className="space-y-2">
  <Label htmlFor="passwordDoublecheck">비밀번호 확인</Label>
  <Input type="password" {...register("passwordDoublecheck")} />
</div>
<div className="space-y-2">
  <Label htmlFor="nickname">닉네임</Label>
  <Input {...register("nickname")} />
</div>
<div className="space-y-2">
  <Label htmlFor="phone">휴대폰번호</Label>
  <Input type="tel" {...register("phone")} />
</div>
```

### 분석

| 요소 | Login | Register | 공통화 가능? |
|------|-------|----------|--------------|
| 이메일 입력 | 단순 Input | Input + 인증 버튼 + 인증코드 필드 | ❌ **다름** |
| 비밀번호 입력 | Input 1개 | Input 2개 (확인 포함) | ❌ **다름** |
| Label + Input 패턴 | ✅ | ✅ | ✅ **동일** → `FormField` |
| 추가 필드 | 없음 | 닉네임, 휴대폰 | ❌ **다름** |

### 결론: 공통화하지 않고 독립 유지

```
pages/auth/
  ├── login.tsx        # 독립적인 로그인 폼
  └── register.tsx     # 독립적인 회원가입 폼
```

**이유**:
1. **기능적으로 다름**: Login은 단순, Register는 복잡
2. **미래 변경 가능성**: OAuth, 2FA 등 추가 시 서로 다르게 변할 수 있음
3. **변경 독립성**: Login 수정이 Register에 영향 없어야 함
4. **코드 명확성**: 각 페이지가 자신의 요구사항만 담음

---

## 실전 예시

### 예시 1: 좋은 추상화

```tsx
// ✅ shared/ui/form/FormField.tsx
// 디자인 시스템 수준의 패턴
export const FormField = ({ label, error, required, children }) => (
  <div className="space-y-2">
    <Label>
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
    {error && <span className="text-sm text-red-500">{error}</span>}
  </div>
)

// 사용: features/auth-login/ui/LoginForm.tsx
<FormField label="이메일" error={errors.email} required>
  <Input type="email" {...register("email")} />
</FormField>

// 사용: features/auth-signup/ui/SignupForm.tsx
<FormField label="이메일" error={errors.email} required>
  <Input
    type="email"
    disabled={isVerified}
    {...register("email")}
  />
  <Button onClick={handleSendCode}>인증코드받기</Button>
  {showVerifyField && (
    <>
      <Input placeholder="인증코드" {...register("code")} />
      <Button onClick={handleVerify}>제출하기</Button>
    </>
  )}
</FormField>
```

**왜 좋은가?**:
- `FormField`는 **시각적 레이아웃만** 담당
- 실제 **비즈니스 로직은 각 Feature에** 독립적으로 존재
- Props가 단순 (label, error, required, children만)

---

### 예시 2: 나쁜 추상화

```tsx
// ❌ features/auth-common/ui/AuthEmailField.tsx
// 모든 인증 페이지에서 사용하려는 시도
export const AuthEmailField = ({
  withVerification = false,
  withAutoComplete = true,
  disabled = false,
  onSendCode,
  onVerifyCode,
  verified = false,
  showVerifyButton = true,
  verifyButtonText = "인증코드받기",
  ...register
}) => {
  const [showCodeField, setShowCodeField] = useState(false)

  return (
    <div className="space-y-2">
      <Label>이메일</Label>
      <Input
        type="email"
        autoComplete={withAutoComplete ? "email" : "off"}
        disabled={disabled || verified}
        {...register("email")}
      />

      {withVerification && showVerifyButton && (
        <Button
          onClick={() => {
            onSendCode?.()
            setShowCodeField(true)
          }}
          disabled={verified}
        >
          {verifyButtonText}
        </Button>
      )}

      {withVerification && showCodeField && (
        <>
          <Input placeholder="인증코드" {...register("emailVerifyCode")} />
          <Button onClick={onVerifyCode}>제출하기</Button>
        </>
      )}
    </div>
  )
}

// 사용: Login
<AuthEmailField withVerification={false} />

// 사용: Register
<AuthEmailField
  withVerification={true}
  onSendCode={handleSendCode}
  onVerifyCode={handleVerify}
  verified={isVerified}
/>
```

**왜 나쁜가?**:
- Props가 너무 많음 (8개 이상)
- 조건부 로직이 복잡함
- Login 변경이 Register에 영향
- 테스트하기 어려움
- 새로운 요구사항 추가 시 props 계속 증가

---

### 예시 3: 좋은 독립 유지

```tsx
// ✅ features/auth-login/ui/LoginForm.tsx
export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { mutate: login, isPending } = useLogin()

  return (
    <form onSubmit={handleSubmit(login)}>
      <FormField label="이메일" error={errors.email} required>
        <Input type="email" {...register("email")} />
      </FormField>

      <FormField label="비밀번호" error={errors.password} required>
        <Input type="password" {...register("password")} />
      </FormField>

      <Button type="submit" loading={isPending}>
        로그인
      </Button>
    </form>
  )
}

// ✅ features/auth-signup/ui/SignupForm.tsx
export const SignupForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { mutate: signup, isPending } = useSignup()
  const [isVerified, setIsVerified] = useState(false)
  const { mutate: sendCode } = useSendVerificationCode()
  const { mutate: verifyCode } = useVerifyCode()

  return (
    <form onSubmit={handleSubmit(signup)}>
      <FormField label="이메일" error={errors.email} required>
        <Input
          type="email"
          disabled={isVerified}
          {...register("email")}
        />
        <Button onClick={() => sendCode({ email: register.email })}>
          인증코드받기
        </Button>
        <Input placeholder="인증코드" {...register("code")} />
        <Button onClick={() => verifyCode({ code: register.code })}>
          제출하기
        </Button>
      </FormField>

      <FormField label="비밀번호" error={errors.password} required>
        <Input type="password" {...register("password")} />
      </FormField>

      <FormField label="비밀번호 확인" error={errors.passwordConfirm} required>
        <Input type="password" {...register("passwordConfirm")} />
      </FormField>

      <FormField label="닉네임" error={errors.nickname} required>
        <Input {...register("nickname")} />
      </FormField>

      <FormField label="휴대폰번호" error={errors.phone}>
        <Input type="tel" {...register("phone")} />
      </FormField>

      <Button type="submit" loading={isPending}>
        회원가입
      </Button>
    </form>
  )
}
```

**왜 좋은가?**:
- 각 Form이 독립적
- Login 수정이 Signup에 영향 없음
- 각자의 비즈니스 로직이 명확
- 조건부 로직 없음
- 테스트하기 쉬움

---

## 안티패턴

### 1. Props Drilling으로 모든 케이스 대응

```tsx
// ❌ 안티패턴
<CommonComponent
  variant="login"
  withVerification={false}
  withPasswordConfirm={false}
  showSocialLogin={true}
  enableOAuth={false}
  require2FA={false}
  // ... 계속 늘어남
/>
```

**문제**:
- Props 폭발
- 유지보수 어려움
- 새 기능 추가 시마다 props 증가

---

### 2. Feature 간 import

```tsx
// ❌ 안티패턴
// features/auth-login/ui/LoginForm.tsx
import { EmailField } from '@/features/auth-signup/ui/EmailField'  // ❌

// ✅ 올바른 방법
// 각자 독립적으로 구현하거나, shared로 추출
import { FormField } from '@/shared/ui/form/FormField'  // ✅
```

---

### 3. 조건부 렌더링 남용

```tsx
// ❌ 안티패턴
export const AuthForm = ({ type }) => {
  if (type === 'login') {
    return <LoginFormContent />
  }
  if (type === 'signup') {
    return <SignupFormContent />
  }
  if (type === 'reset') {
    return <ResetFormContent />
  }
  // ...
}

// ✅ 올바른 방법
// 각각 독립적인 컴포넌트로
export const LoginForm = () => { ... }
export const SignupForm = () => { ... }
export const ResetPasswordForm = () => { ... }
```

---

## 리팩토링 가이드

### 언제 공통화를 풀어야 하나?

다음 신호가 보이면 공통 컴포넌트를 분리하세요:

```
🚨 경고 신호:
- Props가 10개 이상
- 조건부 로직(if/삼항연산자)이 3개 이상
- 하나의 케이스를 수정할 때 다른 케이스 테스트 필요
- "이 prop은 X일 때만 필요해"라는 주석
- 새 기능 추가 시마다 props 증가
```

### 리팩토링 절차

```typescript
// Before: 잘못된 추상화
// shared/ui/AuthInput.tsx
export const AuthInput = ({ type, withVerification, ... }) => {
  // 복잡한 조건부 로직
}

// After: 독립적인 컴포넌트들
// features/auth-login/ui/LoginEmailInput.tsx
export const LoginEmailInput = () => {
  return <Input type="email" {...register("email")} />
}

// features/auth-signup/ui/SignupEmailInput.tsx
export const SignupEmailInput = () => {
  return (
    <>
      <Input type="email" disabled={isVerified} {...register("email")} />
      <Button onClick={handleSendCode}>인증코드받기</Button>
      {/* 인증 관련 로직... */}
    </>
  )
}

// 공통 부분은 디자인 시스템으로
// shared/ui/form/FormField.tsx
export const FormField = ({ label, error, children }) => {
  // 단순 레이아웃만
}
```

---

## 체크리스트

### 공통 컴포넌트 생성 전 체크

```
□ 정말 3곳 이상에서 **정확히 동일하게** 사용되는가?
□ Props가 5개 미만인가?
□ 조건부 로직이 2개 미만인가?
□ 한 곳을 수정해도 다른 곳에 영향이 없는가?
□ 미래에 다르게 변경될 가능성이 낮은가?
□ 테스트하기 쉬운가?
□ 이름만 봐도 역할이 명확한가?
```

하나라도 ❌라면 공통화를 재고하세요.

---

## 명언 모음

> **"Duplication is far cheaper than the wrong abstraction."**
> — Sandi Metz

> **"Premature optimization is the root of all evil."**
> — Donald Knuth

> **"Make it work, make it right, make it fast."**
> — Kent Beck

> **"You Aren't Gonna Need It (YAGNI)"**
> — Extreme Programming

---

## 결론

### 핵심 원칙 요약

1. **의심스러우면 복사하라**
   - 추상화는 언제든 나중에 할 수 있다
   - 잘못된 추상화를 풀기는 어렵다

2. **Feature 독립성을 지켜라**
   - Feature 간 의존성은 만들지 않는다
   - 비슷해 보여도 기능이 다르면 복사한다

3. **Rule of Three를 따르라**
   - 3번 반복될 때 비로소 추상화를 고려한다

4. **디자인 시스템만 공유하라**
   - 시각적 패턴은 shared로
   - 비즈니스 로직은 각 feature에

5. **Props 폭발을 경계하라**
   - Props가 많아지면 잘못된 추상화의 신호
   - 조건부 로직이 많아지면 분리 신호

---

**Last Updated**: 2025-11-26
**Contributors**: Development Team
