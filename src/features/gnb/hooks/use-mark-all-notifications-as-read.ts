import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  notificationApi,
  type NotificationResponse,
} from "@/shared/apis/notification";
import type { ApiResponse, CursorPagingResponse } from "@/shared/apis/types";

type NotificationInfiniteData = InfiniteData<
  ApiResponse<CursorPagingResponse<NotificationResponse>>
>;

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllNotificationsAsRead(),
    onSuccess: () => {
      // 모든 알림을 읽음 처리로 캐시 업데이트
      queryClient.setQueryData<NotificationInfiniteData>(
        ["notifications"],
        (oldData) => {
          if (!oldData) return oldData;

          const now = new Date().toISOString();
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                content: page.data.content.map((notification) => ({
                  ...notification,
                  isRead: true,
                  readAt: notification.readAt || now,
                })),
              },
            })),
          };
        }
      );
    },
  });
};
