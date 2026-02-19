import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupApi } from "@/shared/apis/group";

export const useAssignMemberRole = (groupId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: number; role: "HEAD_MANAGER" | "MANAGER" }) =>
      groupApi.assignMemberRole(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["group", "members", groupId],
      });
    },
  });
};

export const useDismissMemberRole = (groupId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      groupApi.dismissMemberRole(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["group", "members", groupId],
      });
    },
  });
};
