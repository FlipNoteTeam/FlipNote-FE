# 모달 관리 패턴 가이드

모달이 많아질수록 상태 관리가 복잡해지는 문제를 해결하기 위한 다양한 패턴 정리

## 목차
1. [로컬 State 관리 (기본)](#1-로컬-state-관리-기본)
2. [Custom Hook 패턴](#2-custom-hook-패턴)
3. [Headless UI 패턴](#3-headless-ui-패턴)
4. [Promise-based Modal (Imperative API)](#4-promise-based-modal-imperative-api)
5. [State Machine 패턴](#5-state-machine-패턴)
6. [Multi-step Modal 패턴](#6-multi-step-modal-패턴)
7. [Context + Provider 패턴](#7-context--provider-패턴)
8. [패턴 선택 가이드](#패턴-선택-가이드)

---

## 1. 로컬 State 관리 (기본)

### 특징
- ✅ 간단하고 직관적
- ✅ 불필요한 전역 상태 오염 방지
- ❌ 모달이 많아지면 보일러플레이트 증가
- ❌ 각 컴포넌트에 상태 관리 코드 반복

### 사용 예시
```typescript
function MyComponent() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsDeleteModalOpen(true)}>삭제</button>
      <button onClick={() => setIsEditModalOpen(true)}>수정</button>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        삭제 확인
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      >
        수정 폼
      </Modal>
    </>
  );
}
```

### 추천 상황
- 1-2개의 간단한 모달만 있을 때
- 빠른 프로토타이핑

---

## 2. Custom Hook 패턴

### 특징
- ✅ 보일러플레이트 코드 감소
- ✅ 재사용 가능한 로직
- ✅ 여전히 로컬 상태 유지
- ✅ 추가적인 기능(toggle 등) 쉽게 확장 가능

### 구현
```typescript
// hooks/useModal.ts
import { useState, useCallback } from 'react';

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
};
```

### 사용 예시
```typescript
function MyComponent() {
  const deleteModal = useModal();
  const editModal = useModal();
  const shareModal = useModal();

  return (
    <>
      <button onClick={deleteModal.open}>삭제</button>
      <button onClick={editModal.open}>수정</button>
      <button onClick={shareModal.open}>공유</button>

      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.close}>
        삭제 확인
      </Modal>

      <Modal isOpen={editModal.isOpen} onClose={editModal.close}>
        수정 폼
      </Modal>

      <Modal isOpen={shareModal.isOpen} onClose={shareModal.close}>
        공유 옵션
      </Modal>
    </>
  );
}
```

### 추천 상황
- 3-5개 정도의 모달이 있을 때
- 로컬 상태를 유지하면서 코드 간결성을 원할 때
- **가장 범용적으로 추천하는 방법**

---

## 3. Headless UI 패턴

### 특징
- ✅ 선언적 API
- ✅ 상태 관리를 컴포넌트가 알아서 처리
- ✅ 접근성(a11y) 자동 처리
- ❌ 프로그래밍 방식 제어가 어려울 수 있음

### 사용 예시 (shadcn/ui Dialog)
```typescript
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

function MyComponent() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button>모달 열기</button>
      </DialogTrigger>
      <DialogContent>
        <h2>모달 내용</h2>
        <p>상태 관리가 내부적으로 처리됩니다</p>
      </DialogContent>
    </Dialog>
  );
}
```

### 외부에서 제어가 필요한 경우
```typescript
function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <button onClick={() => setOpen(false)}>닫기</button>
      </DialogContent>
    </Dialog>
  );
}
```

### 추천 상황
- shadcn/ui, Radix UI 등을 이미 사용 중일 때
- 간단한 트리거-모달 패턴
- 접근성이 중요한 경우

---

## 4. Promise-based Modal (Imperative API)

### 특징
- ✅ 동기적인 코드 플로우
- ✅ confirm, alert 같은 단순한 인터랙션에 최적
- ✅ 함수 호출만으로 모달 제어
- ❌ 복잡한 상호작용(선택 → 확인 등)에는 부적합
- ❌ React의 선언적 패러다임과 다소 상충

### 구현 (간단한 버전)
```typescript
// lib/modal-service.tsx
import { create } from 'zustand';

type ModalConfig = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

type ModalStore = {
  isOpen: boolean;
  config: ModalConfig | null;
  resolver: ((value: boolean) => void) | null;
  confirm: (config: ModalConfig) => Promise<boolean>;
  resolve: (value: boolean) => void;
};

export const useModalStore = create<ModalStore>((set, get) => ({
  isOpen: false,
  config: null,
  resolver: null,

  confirm: (config) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        config,
        resolver: resolve
      });
    });
  },

  resolve: (value) => {
    const { resolver } = get();
    if (resolver) {
      resolver(value);
      set({
        isOpen: false,
        config: null,
        resolver: null
      });
    }
  },
}));

// components/ConfirmModal.tsx
export function ConfirmModal() {
  const { isOpen, config, resolve } = useModalStore();

  if (!config) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resolve(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          {config.description && (
            <DialogDescription>{config.description}</DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => resolve(false)}>
            {config.cancelText || '취소'}
          </Button>
          <Button onClick={() => resolve(true)}>
            {config.confirmText || '확인'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 사용 예시
```typescript
import { useModalStore } from '@/lib/modal-service';

function MyComponent() {
  const { confirm } = useModalStore();

  const handleDelete = async () => {
    const result = await confirm({
      title: '정말 삭제하시겠습니까?',
      description: '이 작업은 되돌릴 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소',
    });

    if (result) {
      // 삭제 로직
      console.log('삭제됨');
    }
  };

  return <button onClick={handleDelete}>삭제</button>;
}
```

### 추천 상황
- confirm, alert 같은 단순 확인 다이얼로그
- 삭제 확인, 저장 확인 등
- **복잡한 플로우에는 사용하지 말 것**

---

## 5. State Machine 패턴

### 특징
- ✅ 복잡한 플로우를 명확하게 표현
- ✅ 상태 전환이 명시적
- ✅ 디버깅이 쉬움
- ✅ 뒤로가기/취소 처리가 자연스러움
- ❌ 초기 설정이 다소 복잡

### 구현
```typescript
type FlowState =
  | { step: 'closed' }
  | { step: 'selecting'; selectedItem?: Item }
  | { step: 'confirming'; selectedItem: Item }
  | { step: 'processing'; selectedItem: Item }
  | { step: 'completed' };

function MyComponent() {
  const [flowState, setFlowState] = useState<FlowState>({ step: 'closed' });

  const handleSelect = (item: Item) => {
    setFlowState({ step: 'confirming', selectedItem: item });
  };

  const handleConfirm = async () => {
    if (flowState.step !== 'confirming') return;

    setFlowState({ step: 'processing', selectedItem: flowState.selectedItem });

    try {
      await processItem(flowState.selectedItem);
      setFlowState({ step: 'completed' });

      // 2초 후 닫기
      setTimeout(() => {
        setFlowState({ step: 'closed' });
      }, 2000);
    } catch (error) {
      // 에러 처리
      setFlowState({ step: 'confirming', selectedItem: flowState.selectedItem });
    }
  };

  const handleBack = () => {
    if (flowState.step === 'confirming') {
      setFlowState({ step: 'selecting' });
    }
  };

  return (
    <>
      <button onClick={() => setFlowState({ step: 'selecting' })}>
        항목 선택
      </button>

      {/* 선택 모달 */}
      {flowState.step === 'selecting' && (
        <Modal isOpen onClose={() => setFlowState({ step: 'closed' })}>
          <ItemList onSelect={handleSelect} />
        </Modal>
      )}

      {/* 확인 모달 */}
      {flowState.step === 'confirming' && (
        <Modal isOpen onClose={() => setFlowState({ step: 'closed' })}>
          <h2>{flowState.selectedItem.name}을(를) 선택하시겠습니까?</h2>
          <button onClick={handleBack}>뒤로</button>
          <button onClick={handleConfirm}>확인</button>
        </Modal>
      )}

      {/* 처리 중 모달 */}
      {flowState.step === 'processing' && (
        <Modal isOpen>
          <Spinner />
          <p>처리 중...</p>
        </Modal>
      )}

      {/* 완료 모달 */}
      {flowState.step === 'completed' && (
        <Modal isOpen>
          <CheckIcon />
          <p>완료되었습니다!</p>
        </Modal>
      )}
    </>
  );
}
```

### 추천 상황
- 복잡한 다단계 플로우 (선택 → 확인 → 처리 → 완료)
- 상태 전환이 많은 경우
- 뒤로가기가 필요한 경우
- **가장 명확하고 안정적인 패턴**

---

## 6. Multi-step Modal 패턴

### 특징
- ✅ State Machine보다 간단
- ✅ 한 모달 안에서 여러 단계 표현
- ✅ UI가 일관성 있게 유지됨
- ❌ 매우 복잡한 플로우에는 State Machine이 더 나음

### 구현
```typescript
type Step = 'select' | 'confirm' | 'result';

function MyComponent() {
  const [step, setStep] = useState<Step>('select');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const modal = useModal();

  const handleOpen = () => {
    setStep('select');
    setSelectedItem(null);
    modal.open();
  };

  const handleSelect = (item: Item) => {
    setSelectedItem(item);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!selectedItem) return;

    setStep('result');
    await processItem(selectedItem);

    // 완료 후 닫기
    setTimeout(() => {
      modal.close();
    }, 2000);
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('select');
    }
  };

  const handleClose = () => {
    modal.close();
    // 모달이 완전히 닫힌 후 상태 초기화
    setTimeout(() => {
      setStep('select');
      setSelectedItem(null);
    }, 300);
  };

  return (
    <>
      <button onClick={handleOpen}>항목 선택</button>

      <Modal isOpen={modal.isOpen} onClose={handleClose}>
        {/* Step 1: 선택 */}
        {step === 'select' && (
          <div>
            <DialogHeader>
              <DialogTitle>항목을 선택하세요</DialogTitle>
            </DialogHeader>
            <ItemList onSelect={handleSelect} />
          </div>
        )}

        {/* Step 2: 확인 */}
        {step === 'confirm' && selectedItem && (
          <div>
            <DialogHeader>
              <DialogTitle>확인</DialogTitle>
              <DialogDescription>
                {selectedItem.name}을(를) 선택하시겠습니까?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>
                뒤로
              </Button>
              <Button onClick={handleConfirm}>
                확인
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 3: 결과 */}
        {step === 'result' && (
          <div>
            <CheckIcon className="w-12 h-12 text-green-500 mx-auto" />
            <p className="text-center mt-4">완료되었습니다!</p>
          </div>
        )}
      </Modal>
    </>
  );
}
```

### 애니메이션 추가
```typescript
import { motion, AnimatePresence } from 'framer-motion';

<Modal isOpen={modal.isOpen} onClose={handleClose}>
  <AnimatePresence mode="wait">
    {step === 'select' && (
      <motion.div
        key="select"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
      >
        <ItemList onSelect={handleSelect} />
      </motion.div>
    )}

    {step === 'confirm' && (
      <motion.div
        key="confirm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
      >
        <ConfirmStep />
      </motion.div>
    )}
  </AnimatePresence>
</Modal>
```

### 추천 상황
- 2-4단계 정도의 플로우
- UI 일관성을 유지하고 싶을 때
- State Machine은 과하다고 느껴질 때
- **실무에서 가장 많이 사용**

---

## 7. Context + Provider 패턴

### 특징
- ✅ 특정 영역에서 모달을 전역적으로 관리
- ✅ 깊은 컴포넌트 트리에서 props drilling 방지
- ✅ 페이지별로 모달 그룹화 가능
- ❌ 설정이 복잡할 수 있음

### 구현
```typescript
// contexts/MyPageModalContext.tsx
type ModalContextType = {
  editProfile: ReturnType<typeof useModal>;
  deleteAccount: ReturnType<typeof useModal>;
  changePassword: ReturnType<typeof useModal>;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const useMyPageModals = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useMyPageModals must be used within MyPageModalProvider');
  }
  return context;
};

export function MyPageModalProvider({ children }: { children: React.ReactNode }) {
  const editProfile = useModal();
  const deleteAccount = useModal();
  const changePassword = useModal();

  return (
    <ModalContext.Provider value={{ editProfile, deleteAccount, changePassword }}>
      {children}

      {/* 모달 컴포넌트들을 한 곳에서 관리 */}
      <EditProfileModal
        isOpen={editProfile.isOpen}
        onClose={editProfile.close}
      />
      <DeleteAccountModal
        isOpen={deleteAccount.isOpen}
        onClose={deleteAccount.close}
      />
      <ChangePasswordModal
        isOpen={changePassword.isOpen}
        onClose={changePassword.close}
      />
    </ModalContext.Provider>
  );
}
```

### 사용 예시
```typescript
// pages/MyPage.tsx
function MyPage() {
  return (
    <MyPageModalProvider>
      <ProfileSection />
      <SecuritySection />
      <SettingsSection />
    </MyPageModalProvider>
  );
}

// components/ProfileSection.tsx
function ProfileSection() {
  const { editProfile } = useMyPageModals();

  return (
    <div>
      <h2>프로필</h2>
      <button onClick={editProfile.open}>프로필 수정</button>
    </div>
  );
}

// components/SecuritySection.tsx (깊은 트리)
function SecuritySection() {
  const { deleteAccount, changePassword } = useMyPageModals();

  return (
    <div>
      <h2>보안</h2>
      <button onClick={changePassword.open}>비밀번호 변경</button>
      <DangerZone>
        <button onClick={deleteAccount.open}>계정 삭제</button>
      </DangerZone>
    </div>
  );
}
```

### 추천 상황
- 한 페이지에 여러 모달이 산재되어 있을 때
- 컴포넌트 트리가 깊을 때
- 모달을 한 곳에서 선언적으로 관리하고 싶을 때

---

## 패턴 선택 가이드

### 🎯 간단한 경우 (1-2개 모달)
```
로컬 State 관리 또는 Headless UI 패턴
```

### 🎯 중간 복잡도 (3-5개 모달)
```
Custom Hook 패턴 (useModal)
```

### 🎯 단순 확인 다이얼로그
```
Promise-based Modal
```

### 🎯 복잡한 다단계 플로우
```
상황에 따라:
- 2-4단계: Multi-step Modal
- 5단계 이상 또는 복잡한 상태 전환: State Machine
```

### 🎯 페이지별 모달 그룹 관리
```
Context + Provider 패턴
```

---

## 실전 조합 예시

실무에서는 여러 패턴을 조합해서 사용합니다:

```typescript
// 전역 confirm 모달 (Promise-based)
import { useModalStore } from '@/lib/modal-service';

// 페이지별 복잡한 모달 (Custom Hook + Multi-step)
function MyPage() {
  const { confirm } = useModalStore();
  const complexModal = useModal();
  const [step, setStep] = useState<Step>('select');

  const handleQuickDelete = async () => {
    // 간단한 확인은 Promise-based
    const confirmed = await confirm({
      title: '삭제하시겠습니까?',
    });

    if (confirmed) {
      await deleteItem();
    }
  };

  const handleComplexFlow = () => {
    // 복잡한 플로우는 Multi-step
    complexModal.open();
    setStep('select');
  };

  return (
    <>
      <button onClick={handleQuickDelete}>빠른 삭제</button>
      <button onClick={handleComplexFlow}>복잡한 작업</button>

      <Modal isOpen={complexModal.isOpen} onClose={complexModal.close}>
        {/* Multi-step 로직 */}
      </Modal>
    </>
  );
}
```

---

## 결론

- **대부분의 경우**: Custom Hook (`useModal`) 사용
- **복잡한 플로우**: Multi-step Modal 또는 State Machine
- **간단한 확인**: Promise-based Modal
- **일관성 유지**: 프로젝트 내에서 패턴을 2-3개로 제한

모달 관리에 정답은 없습니다. 프로젝트의 복잡도와 팀의 선호도에 맞춰 선택하세요!
