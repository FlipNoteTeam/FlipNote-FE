import apiClient from "@/shared/apis/fetch";
import type { ApiResponse } from "@/shared/apis/types";

// Auth API 전용 타입들
export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserRegisterRequest {
  email: string;
  password?: string;
  name: string;
  nickname: string;
  smsAgree: boolean;
  phone?: string;
  profileImageUrl?: string;
  normalizedPhone?: string;
}

export interface UserRegisterResponse {
  userId: number;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
}

export interface PasswordResetCreateRequest {
  email: string;
}

export interface PasswordResetRequest {
  token: string;
  password?: string;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerifyRequest {
  email: string;
  code: string;
}

export interface SocialLinkResponse {
  socialLinkId: number;
  provider: string;
  linkedAt: string;
}

export interface SocialLinksResponse {
  socialLinks: SocialLinkResponse[];
}

export const authApi = {
  // 로그인
  login: (data: UserLoginRequest) =>
    apiClient.post<ApiResponse>("/auth/login", data),

  // 회원가입
  register: (data: UserRegisterRequest) =>
    apiClient.post<ApiResponse<UserRegisterResponse>>("/auth/register", data),

  // 로그아웃
  logout: () => apiClient.post("/auth/logout"),

  // 토큰 갱신
  refreshToken: () => apiClient.post<ApiResponse>("/auth/token/refresh"),

  // 내 비밀번호 변경
  updatePassword: (data: ChangePasswordRequest) =>
    apiClient.patch("/auth/password", data),

  // 비밀번호 재설정 링크 전송
  requestPasswordReset: (data: PasswordResetCreateRequest) =>
    apiClient.post("/auth/password-reset/request", data),

  // 비밀번호 재설정
  resetPassword: (data: PasswordResetRequest) =>
    apiClient.post("/auth/password-reset", data),

  // 이메일 인증번호 전송
  sendEmailVerificationCode: (data: EmailVerificationRequest) =>
    apiClient.post("/auth/email-verification/request", data),

  // 이메일 인증번호 확인
  verifyEmail: (data: EmailVerifyRequest) =>
    apiClient.post("/auth/email-verification", data),

  // 내 소셜 연동 계정 목록 조회
  getSocialLinks: () =>
    apiClient.get<ApiResponse<SocialLinksResponse>>("/auth/social-links"),

  // 소셜 인증 URL로 리다이렉트
  redirectToSocialLink: () => "",

  // 소셜 연동 해제
  deleteSocialLink: (socialLinkId: number) =>
    apiClient.delete(`/auth/social-links/${socialLinkId}`),
};
