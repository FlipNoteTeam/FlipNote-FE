import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/shared/apis";

interface UseRegisterCallbacks {
  onRegisterSuccess?: () => void;
  onCodeSent?: () => void;
}

/**
 * 회원가입 비즈니스 로직 훅
 */
export const useRegister = (callbacks?: UseRegisterCallbacks) => {
  const { mutate: register, isPending: isRegisterPending } = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      callbacks?.onRegisterSuccess?.();
    },
  });

  const { mutate: sendCode, isPending: isSendingCode } = useMutation({
    mutationFn: authApi.sendEmailVerificationCode,
    onSuccess: () => {
      callbacks?.onCodeSent?.();
    },
  });

  const { mutate: verifyEmail, isPending: isVerifyingEmail } = useMutation({
    mutationFn: authApi.verifyEmail,
  });

  return {
    register,
    sendCode,
    verifyEmail,
    isRegisterPending,
    isSendingCode,
    isVerifyingEmail,
  };
};
