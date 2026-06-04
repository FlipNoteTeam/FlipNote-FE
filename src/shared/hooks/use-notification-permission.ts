import { useSyncExternalStore } from "react";
import { notificationPermissionStore } from "@/shared/libs/notification-permission";

export const useNotificationPermission = () => {
  const permission = useSyncExternalStore(
    notificationPermissionStore.subscribe,
    notificationPermissionStore.getSnapshot,
    () => "default" as NotificationPermission,
  );
  return {
    permission,
    requestPermission: notificationPermissionStore.requestPermission,
  };
};
