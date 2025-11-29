import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/shared/apis/auth";
import useAuthStore from "@/stores/useAuthStore";

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
