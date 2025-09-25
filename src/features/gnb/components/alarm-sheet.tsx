import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/sheet";
import { Button } from "@/shared/components/button";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

type Alarm = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: "info" | "warning" | "error" | "success";
};

type Props = {
  alarms?: Alarm[];
  isLoading?: boolean;
  onMarkAsRead?: (alarmId: string) => void;
  onMarkAllAsRead?: () => void;
  children: (props: {
    unreadCount: number;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
  }) => React.ReactNode;
};

const AlarmSheet = ({
  alarms = [],
  isLoading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  children,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = alarms.filter((alarm) => !alarm.isRead).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children({ unreadCount, isOpen, setIsOpen })}
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>알림</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
                모두 읽음
              </Button>
            )}
          </div>
          <SheetDescription>새로운 알림을 확인하세요</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">알림을 불러오는 중...</div>
            </div>
          ) : alarms.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">
                새로운 알림이 없습니다
              </div>
            </div>
          ) : (
            alarms.map((alarm) => (
              <div
                key={alarm.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  alarm.isRead
                    ? "bg-gray-50 border-gray-200"
                    : "bg-white border-blue-200 shadow-sm"
                }`}
                onClick={() => onMarkAsRead?.(alarm.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4
                      className={`font-medium ${
                        alarm.isRead ? "text-gray-700" : "text-gray-900"
                      }`}
                    >
                      {alarm.title}
                    </h4>
                    <p
                      className={`mt-1 text-sm ${
                        alarm.isRead ? "text-gray-500" : "text-gray-600"
                      }`}
                    >
                      {alarm.message}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(alarm.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!alarm.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AlarmSheet;
