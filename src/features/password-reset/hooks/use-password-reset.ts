import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { authApi, type PasswordResetRequest } from "@/shared/apis/auth";
import { useNavigate } from "@tanstack/react-router";
import type { ApiError } from "@/shared/apis";

interface PasswordResetForm {
  token: string;
  password: string;
  passwordConfirm: string;
}

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
    watch,
    formState: { errors },
  } = useForm<PasswordResetForm>({
    defaultValues: { token: defaultValue?.token ?? "" },
  });

  const password = watch("password");

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
  });

  const onSubmit = (data: PasswordResetForm) => {
    resetMutation.mutate({
      token: data.token,
      password: data.password,
    });
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    password,
    errorMessage,
    isPending: resetMutation.isPending,
  };
};
