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

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) =>
      notificationApi.markNotificationAsRead(notificationId),
    meta: { errorFallback: "알림 읽음 처리에 실패했습니다." },
    onSuccess: (_, notificationId) => {
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
                content: page.data.content.map(
                  (notification: NotificationResponse) =>
                    notification.notificationId === notificationId
                      ? {
                          ...notification,
                          isRead: true,
                          readAt: new Date().toISOString(),
                        }
                      : notification
                ),
              },
            })),
          };
        }
      );
    },
  });
};
