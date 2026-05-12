import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authApi, type PasswordResetRequest } from "@/shared/apis/auth";
import { useNavigate } from "@tanstack/react-router";
import type { ApiError } from "@/shared/apis";
import {
  passwordResetSchema,
  type PasswordResetFormField,
} from "@/features/password-reset/schemas/form.schema";

interface UsePasswordResetProps {
  defaultValue?: { token?: string };
}

export const usePasswordReset = ({ defaultValue }: UsePasswordResetProps) => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>("");
  console.log(defaultValue);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetFormField>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { token: defaultValue?.token ?? "" },
  });

  const resetMutation = useMutation({
    mutationFn: (data: PasswordResetRequest) => authApi.resetPassword(data),
    onSuccess: () => {
      alert("비밀번호가 성공적으로 재설정되었습니다.");
      navigate({ to: "/auth/login" });
    },
    onError: (error: ApiError) => {
      setErrorMessage(
        error?.response?.data?.message ||
          "비밀번호 재설정에 실패했습니다. 다시 시도해주세요.",
      );
    },
    meta: { skipErrorToast: true },
  });

  const onSubmit = (data: PasswordResetFormField) => {
    resetMutation.mutate({
      token: data.token,
      password: data.password,
    });
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    errorMessage,
    isPending: resetMutation.isPending,
  };
};
