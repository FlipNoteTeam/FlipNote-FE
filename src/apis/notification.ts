import apiClient from "@/apis/fetch";
import type { CursorPagingResponse } from "@/apis/types";

// Notification API 전용 타입들
export interface NotificationResponse {
  notificationId: number;
  groupId: number;
  message: string;
  metadata: Record<string, string | number>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationListRequest {
  cursor?: string;
  size?: number;
  sortBy?: string;
  order?: string;
  groupId?: number;
  read?: boolean;
}

export interface TokenRegisterRequest {
  token: string;
}

export const notificationApi = {
  // 알림 목록 조회
  getNotifications: (params: NotificationListRequest) =>
    apiClient.get<CursorPagingResponse<NotificationResponse>>(
      "/notifications",
      { params }
    ),

  // 알림 읽음 처리
  markNotificationAsRead: (notificationId: number) =>
    apiClient.post(`/notifications/${notificationId}/read`),

  // 모든 알림 읽음 처리
  markAllNotificationsAsRead: () => apiClient.post("/notifications/read-all"),

  // FCM 토큰 등록
  registerFcmToken: (data: TokenRegisterRequest) =>
    apiClient.post<string>("/notifications/token", data),
};
