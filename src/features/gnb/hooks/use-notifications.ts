import { useInfiniteQuery } from "@tanstack/react-query";
import {
  notificationApi,
  NOTIFICATIONS_QUERY_KEY,
  type NotificationListRequest,
} from "@/shared/apis/notification";

export { NOTIFICATIONS_QUERY_KEY };

export const useNotifications = (
  params?: Omit<NotificationListRequest, "cursor">
) => {
  return useInfiniteQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, params],
    queryFn: async ({ pageParam }) => {
      const response = await notificationApi.getNotifications({
        ...params,
        cursor: pageParam,
        size: params?.size || 20,
      });
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.data.hasNext ? lastPage.data.nextCursor : undefined;
    },
    select: (data) => {
      const allNotifications = data.pages.flatMap((page) => page.data.content);
      return {
        pages: data.pages,
        pageParams: data.pageParams,
        notifications: allNotifications,
        unreadCount: allNotifications.filter((n) => !n.isRead).length,
      };
    },
  });
};
