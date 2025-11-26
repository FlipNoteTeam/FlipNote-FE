import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/shared/apis";
import useAuthStore from "@/stores/useAuthStore";

/**
 * 로그인 비즈니스 로직 훅
 */
export const useLogin = (onSuccess?: () => void) => {
  const updateAccessToken = useAuthStore((state) => state.updateAccessToken);

  const { mutate: login, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (res) => {
      await updateAccessToken(res.data.data.accessToken);
      onSuccess?.();
    },
  });

  return { login, isPending };
};
