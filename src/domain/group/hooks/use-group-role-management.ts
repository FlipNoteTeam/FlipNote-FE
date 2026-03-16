import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupApi } from "@/shared/apis/group";
import type { ROLE } from "@/shared/apis";

export const useModifyMemberRole = (groupId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { memberId: number; role: ROLE }) =>
      groupApi.changeMemberRole(groupId, data.memberId, { role: data.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["group", "members", groupId],
      });
    },
  });
};
