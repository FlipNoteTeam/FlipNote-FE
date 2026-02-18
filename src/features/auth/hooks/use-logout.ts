import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/shared/apis/auth";
import useAuthStore from "@/stores/use-auth-store";

export const useLogout = () => {
  const clearUser = useAuthStore((state) => state.clearUser);

  return useMutation({
    mutationFn: async () => {
      await authApi.logout();
    },
    onSuccess: () => {
      clearUser();
    },
  });
};
