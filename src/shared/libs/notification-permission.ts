type PermissionListener = () => void;
const listeners = new Set<PermissionListener>();

const notify = () => listeners.forEach((l) => l());

// Permissions API로 브라우저 설정 변경도 감지
if (typeof navigator !== "undefined" && "permissions" in navigator) {
  navigator.permissions
    .query({ name: "notifications" as PermissionName })
    .then((status) => {
      status.addEventListener("change", notify);
    })
    .catch(() => {});
}

export const notificationPermissionStore = {
  getSnapshot: (): NotificationPermission =>
    typeof Notification !== "undefined" ? Notification.permission : "default",

  subscribe: (listener: PermissionListener): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  requestPermission: async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      notify();
      return result === "granted";
    } catch {
      return false;
    }
  },
};
