import { useQuery } from "@tanstack/react-query";
import { groupApi } from "@/shared/apis/group";

export const useGroupMembers = (groupId: number) => {
  return useQuery({
    queryKey: ["group", "members", groupId],
    queryFn: async () => {
      const response = await groupApi.getGroupMembers(groupId);
      return response.data.data.groupMembers;
    },
    enabled: !!groupId,
  });
};
