import { useMutation } from "@tanstack/react-query";
import { authApi, type UserLoginRequest } from "@/shared/apis/auth";
import useAuthStore from "@/stores/use-auth-store";

export const useLogin = () => {
  const syncUser = useAuthStore((state) => state.syncUser);

  return useMutation({
    mutationFn: async (data: UserLoginRequest) => {
      await authApi.login(data);
      await syncUser();
    },
    // 로그인 실패 시 인라인 ErrorMessage로 표시하므로 글로벌 toast 비활성
    meta: { skipErrorToast: true },
  });
};
