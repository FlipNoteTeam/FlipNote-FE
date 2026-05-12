import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authApi, type PasswordResetCreateRequest } from "@/shared/apis/auth";
import type { ApiError } from "@/shared/apis";
import {
  passwordResetRequestSchema,
  type PasswordResetRequestFormField,
} from "@/features/password-reset/schemas/form.schema";

export const usePasswordResetRequest = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequestFormField>({
    resolver: zodResolver(passwordResetRequestSchema),
  });

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
    meta: { skipErrorToast: true },
  });

  const onSubmit = (data: PasswordResetRequestFormField) => {
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
