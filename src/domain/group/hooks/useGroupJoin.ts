import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupJoinApi } from "@/shared/apis/group-join";
import type { GroupJoinRequest } from "@/shared/apis/group-join";

export const useGroupJoin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: number; data?: GroupJoinRequest }) =>
      groupJoinApi.joinRequest(groupId, data),
    onSuccess: () => {
      // 가입 신청 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["groups", "joins"] });
      queryClient.invalidateQueries({ queryKey: ["groups", "joins", "me"] });
    },
  });
};

export const useCancelGroupJoin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, joinId }: { groupId: number; joinId: number }) =>
      groupJoinApi.deleteJoinRequest(groupId, joinId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", "joins"] });
      queryClient.invalidateQueries({ queryKey: ["groups", "joins", "me"] });
    },
  });
};
