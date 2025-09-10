import apiClient from "@/shared/apis/fetch";

// User API 전용 타입들
export interface UserInfoResponse {
  userId: number;
  nickname: string;
  profileImageUrl?: string;
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
  getMyInfo: () => apiClient.get<MyInfoResponse>("/users/me"),

  // 회원 정보 조회
  getUserInfo: (userId: number) =>
    apiClient.get<UserInfoResponse>(`/users/${userId}`),

  // 회원 정보 수정
  updateUser: (data: UserUpdateRequest) =>
    apiClient.put<UserUpdateResponse>("/users", data),

  // 회원 탈퇴
  withdrawUser: () => apiClient.delete("/users"),
};
