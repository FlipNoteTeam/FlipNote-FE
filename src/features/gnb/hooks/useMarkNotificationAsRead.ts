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

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) =>
      notificationApi.markNotificationAsRead(notificationId),
    onSuccess: (_, notificationId) => {
      // 캐시 업데이트
      queryClient.setQueryData<NotificationInfiniteData>(
        ["notifications"],
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
