import { useQuery } from "@tanstack/react-query";
import { groupApi } from "@/shared/apis/group";

export const useGroupDetail = (groupId: number) => {
  return useQuery({
    queryKey: ["group", "detail", groupId],
    queryFn: async () => {
      const response = await groupApi.getGroupDetail(groupId);
      return response.data.data;
    },
    enabled: !!groupId,
  });
};
