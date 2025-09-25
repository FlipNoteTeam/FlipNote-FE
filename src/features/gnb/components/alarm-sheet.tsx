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
import { useNotifications } from "../hooks/useNotifications";
import { useMarkAllNotificationsAsRead } from "../hooks/useMarkAllNotificationsAsRead";
import AlarmList from "./alarm-list";
import { type NotificationResponse } from "@/shared/apis/notification";

type Props = {
  onNotificationClick?: (notification: NotificationResponse) => void;
  children: (props: {
    unreadCount: number;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
  }) => React.ReactNode;
};

const AlarmSheet = ({ onNotificationClick, children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useNotifications();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const unreadCount = data?.unreadCount || 0;

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                모두 읽음
              </Button>
            )}
          </div>
          <SheetDescription>새로운 알림을 확인하세요</SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <AlarmList onNotificationClick={onNotificationClick} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AlarmSheet;
