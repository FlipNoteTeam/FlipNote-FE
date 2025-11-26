import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { authApi, type UserLoginRequest } from "@/shared/apis";
import useAuthStore from "@/stores/useAuthStore";
import type { LoginFormData } from "./loginSchema";

/**
 * 로그인 비즈니스 로직 훅
 */
export const useLogin = () => {
  const navigate = useNavigate({ from: "/auth/register" });
  const search = useSearch({ from: "/auth/login" });
  const redirectUrl = search.redirect;
  const updateAccessToken = useAuthStore((state) => state.updateAccessToken);

  const { mutate: login, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (res) => {
      await updateAccessToken(res.data.data.accessToken);
      // redirect 파라미터가 있으면 해당 페이지로, 없으면 홈으로
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        navigate({ to: "/" });
      }
    },
  });

  const handleLogin = (data: LoginFormData) => {
    const body: UserLoginRequest = {
      email: data.email,
      password: data.password,
    };
    login(body);
  };

  return {
    handleLogin,
    isPending,
  };
};
