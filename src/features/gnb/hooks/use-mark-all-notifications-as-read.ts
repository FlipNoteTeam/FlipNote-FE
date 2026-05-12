import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  notificationApi,
  NOTIFICATIONS_QUERY_KEY,
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
    meta: { errorFallback: "모든 알림 읽음 처리에 실패했습니다." },
    onSuccess: () => {
      const now = new Date().toISOString();
      queryClient.setQueriesData<NotificationInfiniteData>(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (oldData) => {
          if (!oldData) return oldData;

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
