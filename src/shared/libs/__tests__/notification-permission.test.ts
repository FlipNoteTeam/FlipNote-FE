// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach } from "vitest";

// Stub browser globals before module load (dynamic import below runs after these)
const mockRequestPermission = vi.fn();
const mockAddEventListener = vi.fn();

vi.stubGlobal("Notification", {
  permission: "default" as NotificationPermission,
  requestPermission: mockRequestPermission,
});

vi.stubGlobal("navigator", {
  permissions: {
    query: vi.fn().mockResolvedValue({ addEventListener: mockAddEventListener }),
  },
});

// Dynamic import ensures module-level code runs AFTER stubs are in place
const { notificationPermissionStore } = await import(
  "../notification-permission"
);

describe("notificationPermissionStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (Notification as { permission: NotificationPermission }).permission =
      "default";
  });

  describe("getSnapshot", () => {
    it("현재 Notification.permission을 반환한다", () => {
      (Notification as { permission: NotificationPermission }).permission =
        "granted";
      expect(notificationPermissionStore.getSnapshot()).toBe("granted");
    });

    it("permission이 denied이면 denied를 반환한다", () => {
      (Notification as { permission: NotificationPermission }).permission =
        "denied";
      expect(notificationPermissionStore.getSnapshot()).toBe("denied");
    });
  });

  describe("subscribe / unsubscribe", () => {
    it("리스너를 등록하고 호출 가능한 unsubscribe를 반환한다", () => {
      const listener = vi.fn();
      const unsubscribe = notificationPermissionStore.subscribe(listener);
      expect(typeof unsubscribe).toBe("function");
    });

    it("requestPermission 후 등록된 리스너가 호출된다", async () => {
      mockRequestPermission.mockResolvedValue("granted");
      const listener = vi.fn();
      notificationPermissionStore.subscribe(listener);

      await notificationPermissionStore.requestPermission();

      expect(listener).toHaveBeenCalled();
    });

    it("unsubscribe 후에는 리스너가 호출되지 않는다", async () => {
      mockRequestPermission.mockResolvedValue("granted");
      const listener = vi.fn();
      const unsubscribe = notificationPermissionStore.subscribe(listener);
      unsubscribe();

      await notificationPermissionStore.requestPermission();

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("requestPermission", () => {
    it("granted → true를 반환한다", async () => {
      mockRequestPermission.mockResolvedValue("granted");
      expect(await notificationPermissionStore.requestPermission()).toBe(true);
    });

    it("denied → false를 반환한다", async () => {
      mockRequestPermission.mockResolvedValue("denied");
      expect(await notificationPermissionStore.requestPermission()).toBe(false);
    });

    it("default → false를 반환한다", async () => {
      mockRequestPermission.mockResolvedValue("default");
      expect(await notificationPermissionStore.requestPermission()).toBe(false);
    });

    it("예외 발생 시 false를 반환한다", async () => {
      mockRequestPermission.mockRejectedValue(new Error("denied by browser"));
      expect(await notificationPermissionStore.requestPermission()).toBe(false);
    });
  });
});
