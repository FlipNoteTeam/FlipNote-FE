import apiClient from "@/shared/apis/fetch";
import type {
  ApiResponse,
  GroupCategory,
  GroupInfo,
  GroupMemberInfo,
  CursorPagingResponse,
  ROLE,
} from "@/shared/apis/types";

export type GroupVisibilityOption = "PUBLIC" | "PRIVATE";
export type GroupJoinPolicyOption = "OPEN" | "APPROVAL";

interface GroupDetail {
  name: string;
  category: GroupCategory;
  description: string;
  joinPolicy: GroupJoinPolicyOption;
  visibility: GroupVisibilityOption;
  maxMember: number;
  imageRefId?: number;
}

export type GroupCreateRequest = GroupDetail;

// Group API 전용 타입들
export interface GroupDetailResponse extends GroupDetail {
  imageUrl?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface GroupCreateResponse {
  groupId: number;
}

export type GroupPutRequest = GroupDetail;

export interface GroupPutResponse extends GroupDetail {
  createdAt: string;
  modifiedAt: string;
}

export interface FindGroupMemberResponse {
  memberInfoList: GroupMemberInfo[];
}

export interface GetMyOwnedGroupsRequest {
  cursor?: string;
  size?: number;
  sortBy?: number;
  order?: number;
  category?: GroupCategory;
}
export interface GetMyOwnedGroupsResponse {
  groupId: number;
  name: string;
  description: string;
  category: GroupCategory;
  imageUrl: string;
  imageRefId: number;
}

export interface GetMyRoleReponse {
  role: ROLE;
  permissions: string[];
}

interface GroupListParams {
  keyword?: string /** 없는 값임 ㅎ */;
  category?: string;
  cursor?: string;
  size?: number;
  sortBy?: string;
  order?: string;
}

export const groupApi = {
  // 그룹 전체 조회 (커서 페이징)
  getGroups: (params?: GroupListParams) =>
    apiClient.get<ApiResponse<CursorPagingResponse<GroupInfo>>>("/groups", {
      params,
    }),

  // 내 그룹 전체 조회 (커서 페이징)
  getMyGroups: (params?: GroupListParams) =>
    apiClient.get<ApiResponse<CursorPagingResponse<GroupInfo>>>("/groups/me", {
      params,
    }),

  // 그룹 상세 조회
  getGroupDetail: (groupId: number) =>
    apiClient.get<ApiResponse<GroupDetailResponse>>(`/groups/${groupId}`),

  // 그룹 생성
  createGroup: (data: GroupCreateRequest) =>
    apiClient.post<ApiResponse<GroupCreateResponse>>("/groups", data),

  // 그룹 수정
  updateGroup: (groupId: number, data: GroupPutRequest) =>
    apiClient.put<ApiResponse<GroupPutResponse>>(`/groups/${groupId}`, data),

  // 그룹 삭제
  deleteGroup: (groupId: number) => apiClient.delete(`/groups/${groupId}`),

  // 그룹 멤버 조회
  getGroupMembers: (groupId: number) =>
    apiClient.get<ApiResponse<FindGroupMemberResponse>>(
      `/groups/${groupId}/members`,
    ),

  // 내가 만든 그룹 조회
  getMyOwnedGroups: (data: GetMyOwnedGroupsRequest) =>
    apiClient.get<ApiResponse<CursorPagingResponse<GetMyOwnedGroupsResponse>>>(
      "/groups/created",
      {
        params: data,
      },
    ),

  // 역할 수정
  changeMemberRole: (
    groupId: number,
    memberId: number,
    data: { role: Omit<ROLE, "OWNER"> },
  ) =>
    apiClient.put<ApiResponse<void>>(
      `/groups/${groupId}/members/${memberId}`,
      data,
    ),

  // 그룹 내 ROLE 조회
  getMyRole: (groupId: number) =>
    apiClient.get<ApiResponse<GetMyRoleReponse>>(
      `/groups/${groupId}/permissions`,
    ),
};
