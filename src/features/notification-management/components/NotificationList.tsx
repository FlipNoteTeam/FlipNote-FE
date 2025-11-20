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
import { Bell, CheckCheck, Calendar, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { mockNotifications } from "@/shared/mocks/notifications";
import { useState } from "react";

const ITEMS_PER_PAGE = 5;

export const NotificationList = () => {
  // TODO: 실제 API 연동 시 주석 해제
  // const {
  //   data,
  //   isLoading,
  //   error,
  // } = useNotifications();

  // Mock 데이터 사용 (개발용)
  const notifications = mockNotifications;
  const isLoading = false;
  const error = null;

  const [currentPage, setCurrentPage] = useState(1);

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  // 페이지네이션 계산
  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentNotifications = notifications.slice(startIndex, endIndex);

  const handleNotificationClick = (notificationId: number, isRead: boolean) => {
    if (!isRead) {
      markAsRead.mutate(notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-red-500">알림을 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>알림이 없습니다.</p>
          </div>
        </CardContent>
      </Card>
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
        {currentNotifications.map((notification) => (
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
                      !notification.isRead
                        ? "text-blue-600"
                        : "text-gray-400"
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

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => setCurrentPage(page)}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            다음
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
