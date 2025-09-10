import apiClient from "@/shared/apis/fetch";
import type {
  GroupCategory,
  GroupInfo,
  GroupMemberInfo,
  CursorPagingResponse,
} from "@/shared/apis/types";

// Group API 전용 타입들
export interface GroupDetailResponse {
  name: string;
  category: GroupCategory;
  description: string;
  applicationRequired: boolean;
  publicVisible: boolean;
  maxMember: number;
  imageUrl?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface GroupCreateRequest {
  name: string;
  category: GroupCategory;
  description: string;
  applicationRequired: boolean;
  publicVisible: boolean;
  maxMember: number;
  image?: string;
}

export interface GroupCreateResponse {
  groupId: number;
}

export interface GroupPutRequest {
  name: string;
  category: GroupCategory;
  description: string;
  applicationRequired: boolean;
  publicVisible: boolean;
  maxMember: number;
  image?: string;
}

export interface GroupPutResponse {
  name: string;
  category: GroupCategory;
  description: string;
  applicationRequired: boolean;
  publicVisible: boolean;
  maxMember: number;
  imageUrl?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface FindGroupMemberResponse {
  groupMembers: GroupMemberInfo[];
}

interface GroupListParams {
  category?: string;
  cursor?: string;
  size?: number;
  sortBy?: string;
  order?: string;
}

export const groupApi = {
  // 그룹 전체 조회 (커서 페이징)
  getGroups: (params?: GroupListParams) =>
    apiClient.get<CursorPagingResponse<GroupInfo>>("/groups", { params }),

  // 내 그룹 전체 조회 (커서 페이징)
  getMyGroups: (params?: GroupListParams) =>
    apiClient.get<CursorPagingResponse<GroupInfo>>("/groups/me", { params }),

  // 그룹 상세 조회
  getGroupDetail: (groupId: number) =>
    apiClient.get<GroupDetailResponse>(`/groups/${groupId}`),

  // 그룹 생성
  createGroup: (data: GroupCreateRequest) =>
    apiClient.post<GroupCreateResponse>("/groups", data),

  // 그룹 수정
  updateGroup: (groupId: number, data: GroupPutRequest) =>
    apiClient.put<GroupPutResponse>(`/groups/${groupId}`, data),

  // 그룹 삭제
  deleteGroup: (groupId: number) => apiClient.delete(`/groups/${groupId}`),

  // 그룹 멤버 조회
  getGroupMembers: (groupId: number) =>
    apiClient.get<FindGroupMemberResponse>(`/groups/${groupId}/members`),
};
