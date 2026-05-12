import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/domain/notification";
import {
  Bell,
  CheckCheck,
  Calendar,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Skeleton } from "@/shared/components/skeleton";
import ErrorDisplay from "@/shared/components/error-display";
import { EmptyState } from "@/shared/components/empty-state";

const NotificationSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <Card key={i}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
              <Skeleton className="h-5 flex-1" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const NotificationList = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotifications();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleNotificationClick = (notificationId: number, isRead: boolean) => {
    if (!isRead) {
      markAsRead.mutate(notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  if (isLoading) return <NotificationSkeleton />;

  if (error) return <ErrorDisplay onRetry={refetch} />;

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Bell className="w-8 h-8" />}
        title="알림이 없습니다"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더: 모든 알림 읽음 처리 */}
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            모두 읽음 처리 ({unreadCount})
          </Button>
        </div>
      )}

      {/* 알림 리스트 */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.notificationId}
            className={`cursor-pointer transition-colors ${
              !notification.isRead
                ? "bg-blue-50 hover:bg-blue-100 border-blue-200"
                : "hover:bg-gray-50"
            }`}
            onClick={() =>
              handleNotificationClick(
                notification.notificationId,
                notification.isRead
              )
            }
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Bell
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      !notification.isRead ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-medium">
                      {notification.message}
                    </CardTitle>
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>그룹 ID: {notification.groupId}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                </div>
                {notification.isRead && notification.readAt && (
                  <span className="text-gray-400">읽음</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 더 보기 */}
      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
          >
            {isFetchingNextPage ? "로딩 중..." : "더 보기"}
          </Button>
        </div>
      )}
    </div>
  );
};
