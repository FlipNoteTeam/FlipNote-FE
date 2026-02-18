import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupInvitationApi } from "@/shared/apis/group-invitation";
import type { GroupInvitationRespondRequest } from "@/shared/apis/group-invitation";

// 받은 초대 목록 조회
export const useIncomingInvitations = () => {
  return useQuery({
    queryKey: ["invitations", "incoming"],
    queryFn: async () => {
      const response = await groupInvitationApi.getIncomingInvitations({
        page: 1,
        size: 20,
      });
      return response.data.data.content;
    },
  });
};

// 초대 응답 (수락/거절)
export const useRespondToInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      invitationId,
      status,
    }: {
      groupId: number;
      invitationId: number;
      status: GroupInvitationRespondRequest["status"];
    }) =>
      groupInvitationApi.respondToGroupInvitation(groupId, invitationId, {
        status,
      }),
    onSuccess: () => {
      // 받은 초대 목록 갱신
      queryClient.invalidateQueries({
        queryKey: ["invitations", "incoming"],
      });
      // 내 그룹 목록도 갱신 (수락한 경우 내 그룹에 추가되므로)
      queryClient.invalidateQueries({
        queryKey: ["myGroups"],
      });
    },
  });
};
