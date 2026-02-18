import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupJoinApi } from "@/shared/apis/group-join";
import type { GroupJoinStatus } from "@/shared/apis/types";

export const useGroupJoinList = (groupId: number) => {
  return useQuery({
    queryKey: ["groups", groupId, "joins"],
    queryFn: async () => {
      const response = await groupJoinApi.getGroupJoinList(groupId);
      return response.data.data.groupJoins;
    },
    enabled: !!groupId,
  });
};

export const useRespondGroupJoin = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      joinId,
      status,
    }: {
      joinId: number;
      status: GroupJoinStatus;
    }) => groupJoinApi.respondToJoinRequest(groupId, joinId, { status }),
    onSuccess: () => {
      // 가입 신청 목록 갱신
      queryClient.invalidateQueries({
        queryKey: ["groups", groupId, "joins"],
      });
      // 그룹 멤버 목록도 갱신 (승인 시 멤버가 추가되므로)
      queryClient.invalidateQueries({
        queryKey: ["group", "members", groupId],
      });
    },
  });
};
