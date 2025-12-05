import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { authApi, type PasswordResetCreateRequest } from "@/shared/apis/auth";
import type { ApiError } from "@/shared/apis";

interface PasswordResetRequestForm {
  email: string;
}

export const usePasswordResetRequest = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequestForm>();

  const requestMutation = useMutation({
    mutationFn: (data: PasswordResetCreateRequest) =>
      authApi.requestPasswordReset(data),
    onSuccess: () => {
      setIsSuccess(true);
      setErrorMessage("");
    },
    onError: (error: ApiError) => {
      setErrorMessage(
        error?.response?.data?.message ||
          "이메일 전송에 실패했습니다. 다시 시도해주세요."
      );
    },
  });

  const onSubmit = (data: PasswordResetRequestForm) => {
    requestMutation.mutate({ email: data.email });
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    errorMessage,
    isSuccess,
    isPending: requestMutation.isPending,
  };
};
