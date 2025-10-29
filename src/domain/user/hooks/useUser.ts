import { useQuery } from "@tanstack/react-query";

import { userApi } from "@/shared/apis";

export const useUser = (userId: number) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await userApi.getUserInfo(userId);
      return response.data.data;
    },
    enabled: !!userId,
  });
};
