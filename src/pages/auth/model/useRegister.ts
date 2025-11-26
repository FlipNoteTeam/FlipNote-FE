import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/shared/apis";

/**
 * 회원가입 비즈니스 로직 훅
 */
export const useRegister = (onSuccess?: () => void) => {
  const { mutate: register, isPending } = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      onSuccess?.();
    },
  });

  return { register, isPending };
};

/**
 * 이메일 인증코드 발송 훅
 */
export const useSendEmailVerificationCode = (onSuccess?: () => void) => {
  const { mutate: sendCode, isPending } = useMutation({
    mutationFn: authApi.sendEmailVerificationCode,
    onSuccess: () => {
      onSuccess?.();
    },
  });

  return { sendCode, isPending };
};

/**
 * 이메일 인증 훅
 */
export const useVerifyEmail = () => {
  const { mutate: verifyEmail, isPending } = useMutation({
    mutationFn: authApi.verifyEmail,
  });

  return { verifyEmail, isPending };
};
