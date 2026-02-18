import { useNotifications } from "../hooks/use-notifications";
import { useMarkNotificationAsRead } from "../hooks/use-mark-notification-as-read";
import { type NotificationResponse } from "@/shared/apis/notification";
import InfiniteScrollList from "@/shared/components/infinite-scroll-list";

type Props = {
  onNotificationClick?: (notification: NotificationResponse) => void;
};

const AlarmList = ({ onNotificationClick }: Props) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useNotifications();

  const markAsReadMutation = useMarkNotificationAsRead();

  const notifications = data?.notifications || [];

  const handleNotificationClick = (notification: NotificationResponse) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.notificationId);
    }
    onNotificationClick?.(notification);
  };

  const renderNotification = (notification: NotificationResponse) => (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
        notification.isRead
          ? "bg-gray-50 border-gray-200"
          : "bg-white border-blue-200 shadow-sm"
      }`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className={`text-sm ${
              notification.isRead ? "text-gray-600" : "text-gray-900"
            }`}
          >
            {notification.message}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            {new Date(notification.createdAt).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {notification.metadata &&
            Object.keys(notification.metadata).length > 0 && (
              <div className="mt-1 text-xs text-gray-500">
                그룹 ID: {notification.groupId}
              </div>
            )}
        </div>
        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2" />
        )}
      </div>
    </div>
  );

  return (
    <InfiniteScrollList
      items={notifications}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isLoading}
      fetchNextPage={fetchNextPage}
      renderItem={renderNotification}
      renderLoading={() => (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-gray-500">알림을 불러오는 중...</div>
        </div>
      )}
      renderEmpty={() => (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-gray-500">새로운 알림이 없습니다</div>
        </div>
      )}
      renderFetchingMore={() => (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-gray-500">
            더 많은 알림을 불러오는 중...
          </div>
        </div>
      )}
    />
  );
};

export default AlarmList;
