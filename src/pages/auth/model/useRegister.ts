import { useState, type MouseEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authApi, type UserRegisterRequest } from "@/shared/apis";
import type { RegisterFormData } from "./registerSchema";

/**
 * 회원가입 비즈니스 로직 훅
 */
export const useRegister = () => {
  const navigate = useNavigate();
  const [activateEmailVerificationField, setActivateEmailVerificationField] =
    useState(false);

  // 회원가입 API
  const { mutate: registerApi, isPending: isRegisterPending } = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      navigate({ to: "/auth/login" });
    },
  });

  // 이메일 인증코드 발송
  const {
    mutate: sendEmailVerificationCode,
    isPending: isSendingCode,
  } = useMutation({
    mutationFn: authApi.sendEmailVerificationCode,
    onSuccess: () => {
      setActivateEmailVerificationField(true);
    },
  });

  // 이메일 인증
  const { mutate: verifyEmail, isPending: isVerifyingEmail } = useMutation({
    mutationFn: authApi.verifyEmail,
  });

  // 인증코드 발송 핸들러
  const handleSendVerificationCode = (
    e: MouseEvent,
    email: string,
    isEmailValid: boolean
  ) => {
    e.preventDefault();
    if (email && isEmailValid) {
      sendEmailVerificationCode({ email });
    }
  };

  // 이메일 인증 핸들러
  const handleVerifyEmail = (
    e: MouseEvent,
    email: string,
    code: string
  ) => {
    e.preventDefault();
    if (email && code) {
      verifyEmail({ email, code });
    }
  };

  // 회원가입 제출 핸들러
  const handleRegister = (data: RegisterFormData) => {
    const payload: UserRegisterRequest = {
      email: data.email,
      name: data.nickname,
      nickname: data.nickname,
      password: data.password,
      smsAgree: data.smsAgree ?? true,
      normalizedPhone: data.phone,
    };
    registerApi(payload);
  };

  return {
    activateEmailVerificationField,
    handleSendVerificationCode,
    handleVerifyEmail,
    handleRegister,
    isSendingCode,
    isVerifyingEmail,
    isRegisterPending,
  };
};
