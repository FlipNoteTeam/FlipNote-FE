import { useInfiniteQuery } from "@tanstack/react-query";
import {
  notificationApi,
  type NotificationListRequest,
} from "@/shared/apis/notification";

const NOTIFICATIONS_QUERY_KEY = ["notifications"];

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
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      notifications: data.pages.flatMap((page) => page.data.content),
      unreadCount:
        data.pages[0]?.data.content.filter((n) => !n.isRead).length || 0,
    }),
  });
};
