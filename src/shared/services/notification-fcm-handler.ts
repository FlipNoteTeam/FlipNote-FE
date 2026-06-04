import type { InfiniteData } from "@tanstack/react-query";
import {
  notificationApi,
  NOTIFICATIONS_QUERY_KEY,
  type NotificationResponse,
} from "@/shared/apis/notification";
import type { ApiResponse, CursorPagingResponse } from "@/shared/apis/types";
import { queryClient } from "@/shared/lib/query-client";

type NotificationPage = ApiResponse<CursorPagingResponse<NotificationResponse>>;

/**
 * FCM 포그라운드 메시지 수신 시 호출.
 * 첫 페이지만 재요청해 신규 알림을 캐시 앞에 prepend한다.
 * 캐시가 없으면 invalidate로 위임한다.
 */
export const handleFCMMessage = async (): Promise<void> => {
  try {
    const response = await notificationApi.getNotifications({ size: 20 });
    const candidates = response.data.data.content;

    const existing = queryClient.getQueriesData<InfiniteData<NotificationPage>>(
      { queryKey: NOTIFICATIONS_QUERY_KEY },
    );

    const hasCache = existing.some(([, data]) => data != null);
    if (!hasCache) {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      return;
    }

    const existingIds = new Set(
      existing.flatMap(
        ([, data]) =>
          data?.pages.flatMap((page) =>
            page.data.content.map((n) => n.notificationId),
          ) ?? [],
      ),
    );

    const newItems = candidates.filter(
      (n) => !existingIds.has(n.notificationId),
    );
    if (newItems.length === 0) return;

    queryClient.setQueriesData<InfiniteData<NotificationPage>>(
      { queryKey: NOTIFICATIONS_QUERY_KEY },
      (old) => {
        if (!old || old.pages.length === 0) return old;
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              data: {
                ...old.pages[0].data,
                content: [...newItems, ...old.pages[0].data.content],
              },
            },
            ...old.pages.slice(1),
          ],
        };
      },
    );
  } catch {
    // FCM 핸들러 실패는 알림 기능이 non-critical이므로 조용히 무시
  }
};
