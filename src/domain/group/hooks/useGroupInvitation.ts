import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupInvitationApi } from "@/shared/apis/group-invitation";
import type { GroupInvitationCreateRequest } from "@/shared/apis/group-invitation";

// 보낸 초대 목록 조회
export const useOutgoingInvitations = (groupId: number) => {
  return useQuery({
    queryKey: ["groups", groupId, "invitations", "outgoing"],
    queryFn: async () => {
      const response = await groupInvitationApi.getOutgoingInvitations(
        groupId,
        { page: 1, size: 100 }
      );
      return response.data.data.content;
    },
    enabled: !!groupId,
  });
};

// 초대 보내기
export const useCreateGroupInvitation = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GroupInvitationCreateRequest) =>
      groupInvitationApi.createGroupInvitation(groupId, data),
    onSuccess: () => {
      // 보낸 초대 목록 갱신
      queryClient.invalidateQueries({
        queryKey: ["groups", groupId, "invitations", "outgoing"],
      });
    },
  });
};

// 초대 취소
export const useDeleteGroupInvitation = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: number) =>
      groupInvitationApi.deleteGroupInvitation(groupId, invitationId),
    onSuccess: () => {
      // 보낸 초대 목록 갱신
      queryClient.invalidateQueries({
        queryKey: ["groups", groupId, "invitations", "outgoing"],
      });
    },
  });
};
