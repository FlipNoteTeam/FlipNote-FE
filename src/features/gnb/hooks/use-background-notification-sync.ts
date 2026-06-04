import { useEffect } from "react";
import { handleFCMMessage } from "@/shared/services/notification-fcm-handler";

/**
 * 탭이 백그라운드에서 포그라운드로 돌아올 때 놓친 FCM 알림을 동기화한다.
 * visibilitychange 이벤트마다 page-1 fetch + ID 비교 후 신규 항목만 prepend.
 */
export const useBackgroundNotificationSync = () => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleFCMMessage();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
};
