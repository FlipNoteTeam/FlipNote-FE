import apiClient from "@/shared/apis/fetch";
import type {
  GroupJoinStatus,
  GroupJoinInfo,
  MyGroupJoinInfo,
} from "@/shared/apis/types";

// Group Join API 전용 타입들
export interface GroupJoinRequest {
  joinIntro?: string;
}

export interface GroupJoinResponse {
  groupJoinId: number;
  status: GroupJoinStatus;
}

export interface GroupJoinListResponse {
  groupJoins: GroupJoinInfo[];
}

export interface FindGroupJoinListMeResponse {
  groupJoins: MyGroupJoinInfo[];
}

export interface GroupJoinRespondRequest {
  status: GroupJoinStatus;
}

export interface GroupJoinRespondResponse {
  groupJoinId: number;
}

export const groupJoinApi = {
  // 가입 신청 요청
  joinRequest: (groupId: number, data?: GroupJoinRequest) =>
    apiClient.post<GroupJoinResponse>(`/groups/${groupId}/joins`, data),

  // 그룹 내 가입 신청 리스트 조회
  getGroupJoinList: (groupId: number) =>
    apiClient.get<GroupJoinListResponse>(`/groups/${groupId}/joins`),

  // 내가 신청한 가입신청 리스트 조회
  getMyGroupJoinList: () =>
    apiClient.get<FindGroupJoinListMeResponse>("/groups/joins/me"),

  // 가입 신청 응답 (승인/거절)
  respondToJoinRequest: (
    groupId: number,
    joinId: number,
    data: GroupJoinRespondRequest
  ) =>
    apiClient.patch<GroupJoinRespondResponse>(
      `/groups/${groupId}/joins/${joinId}`,
      data
    ),

  // 가입 신청 삭제(취소)
  deleteJoinRequest: (groupId: number, joinId: number) =>
    apiClient.delete(`/groups/${groupId}/joins/${joinId}`),
};
