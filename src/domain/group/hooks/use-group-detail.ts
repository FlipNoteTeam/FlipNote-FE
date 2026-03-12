import { useQuery } from "@tanstack/react-query";
import { groupApi } from "@/shared/apis/group";
import { toGroupDetail } from "@/domain/group/types";

export const useGroupDetail = (groupId: number) => {
  return useQuery({
    queryKey: ["group", "detail", groupId],
    queryFn: async () => {
      const response = await groupApi.getGroupDetail(groupId);
      return toGroupDetail(response.data.data);
    },
    enabled: !!groupId,
  });
};
