import apiClient from "@/shared/apis/fetch";
import type { ApiResponse } from "@/shared/apis/types";

// User API 전용 타입들
export interface UserInfoResponse {
  userId: number;
  nickname: string;
  profileImageUrl?: string;
  imageRefId: number;
}

export interface MyInfoResponse {
  userId: number;
  email: string;
  nickname: string;
  name: string;
  phone?: string;
  smsAgree: boolean;
  profileImageUrl?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface UserUpdateRequest {
  nickname: string;
  phone?: string;
  smsAgree: boolean;
  profileImageUrl?: string;
  normalizedPhone?: string;
}

export interface UserUpdateResponse {
  userId: number;
  nickname: string;
  phone?: string;
  smsAgree: boolean;
  profileImageUrl?: string;
}

export const userApi = {
  // 내 정보 조회
  getMyInfo: () => apiClient.get<ApiResponse<MyInfoResponse>>("/users/me"),

  // 회원 정보 조회
  getUserInfo: (userId: number) =>
    apiClient.get<ApiResponse<UserInfoResponse>>(`/users/${userId}`),

  // 회원 정보 수정
  updateUser: (data: UserUpdateRequest) =>
    apiClient.put<ApiResponse<UserUpdateResponse>>("/users", data),

  // 회원 탈퇴
  withdrawUser: () => apiClient.delete("/users"),
};
