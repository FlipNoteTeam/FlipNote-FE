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
  });
};
