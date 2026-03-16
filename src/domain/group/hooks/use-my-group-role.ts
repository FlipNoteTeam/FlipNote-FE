import { useQuery } from "@tanstack/react-query";
import { groupApi } from "@/shared/apis/group";

export const useMyGroupRole = (groupId: number) => {
  return useQuery({
    queryKey: ["group", "my-role", groupId],
    queryFn: async () => {
      const response = await groupApi.getMyRole(groupId);
      return response.data.data;
    },
    enabled: !!groupId,
  });
};
