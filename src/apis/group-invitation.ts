import apiClient from "@/apis/fetch";
import type {
  GroupInvitationStatus,
  PagingResponse,
  PaginationRequest,
} from "@/apis/types";

// Group Invitation API 전용 타입들
export interface GroupInvitationCreateRequest {
  email: string;
}

export interface GroupInvitationCreateResponse {
  invitationId: number;
}

export type GroupInvitationListRequest = PaginationRequest;

export interface OutgoingGroupInvitationResponse {
  invitationId: number;
  inviterUserId: number;
  inviteeUserId: number;
  inviteeEmail: string;
  inviteeNickname: string;
  status: GroupInvitationStatus;
  createdAt: string;
}

export interface IncomingGroupInvitationResponse {
  invitationId: number;
  groupId: number;
  status: GroupInvitationStatus;
  createdAt: string;
}

export interface GroupInvitationRespondRequest {
  status: "ACCEPTED" | "REJECTED";
}

export const groupInvitationApi = {
  // 그룹 초대
  createGroupInvitation: (
    groupId: number,
    data: GroupInvitationCreateRequest
  ) =>
    apiClient.post<GroupInvitationCreateResponse>(
      `/groups/${groupId}/invitations`,
      data
    ),

  // 그룹 초대 보낸 목록 조회
  getOutgoingInvitations: (
    groupId: number,
    params: GroupInvitationListRequest
  ) =>
    apiClient.get<PagingResponse<OutgoingGroupInvitationResponse>>(
      `/groups/${groupId}/invitations`,
      { params }
    ),

  // 그룹 초대 받은 목록 조회
  getIncomingInvitations: (params: GroupInvitationListRequest) =>
    apiClient.get<PagingResponse<IncomingGroupInvitationResponse>>(
      "/group-invitations",
      { params }
    ),

  // 그룹 초대 응답
  respondToGroupInvitation: (
    groupId: number,
    invitationId: number,
    data: GroupInvitationRespondRequest
  ) => apiClient.patch(`/groups/${groupId}/invitations/${invitationId}`, data),

  // 그룹 초대 취소
  deleteGroupInvitation: (groupId: number, invitationId: number) =>
    apiClient.delete(`/groups/${groupId}/invitations/${invitationId}`),
};
