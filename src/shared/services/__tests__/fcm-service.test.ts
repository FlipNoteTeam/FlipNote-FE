import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSetupForegroundMessageListener = vi.fn();

vi.mock("@/shared/libs/firebase", () => ({
  getFCMToken: vi.fn(),
  deleteFCMToken: vi.fn(),
  setupForegroundMessageListener: mockSetupForegroundMessageListener,
}));

vi.mock("@/shared/libs/notification-permission", () => ({
  notificationPermissionStore: { requestPermission: vi.fn() },
}));

vi.mock("@/shared/apis", () => ({
  notificationApi: { registerFcmToken: vi.fn() },
}));

const { initializeForegroundMessageListener, cleanupForegroundMessageListener } =
  await import("@/shared/services/fcm-service");

describe("initializeForegroundMessageListener", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("콜백을 setupForegroundMessageListener에 전달한다", () => {
    const callback = vi.fn();
    mockSetupForegroundMessageListener.mockReturnValue(vi.fn());

    initializeForegroundMessageListener(callback);

    expect(mockSetupForegroundMessageListener).toHaveBeenCalledWith(callback);
  });

  it("재호출 시 이전 리스너를 먼저 정리하고 새로 등록한다", () => {
    const firstUnsubscribe = vi.fn();
    mockSetupForegroundMessageListener.mockReturnValueOnce(firstUnsubscribe);
    mockSetupForegroundMessageListener.mockReturnValueOnce(vi.fn());

    initializeForegroundMessageListener(vi.fn());
    initializeForegroundMessageListener(vi.fn());

    expect(firstUnsubscribe).toHaveBeenCalledTimes(1);
    expect(mockSetupForegroundMessageListener).toHaveBeenCalledTimes(2);
  });

  it("setupForegroundMessageListener가 null을 반환해도 예외가 발생하지 않는다", () => {
    mockSetupForegroundMessageListener.mockReturnValue(null);

    expect(() => initializeForegroundMessageListener(vi.fn())).not.toThrow();
  });
});

describe("cleanupForegroundMessageListener", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("등록된 리스너를 해제한다", () => {
    const unsubscribe = vi.fn();
    mockSetupForegroundMessageListener.mockReturnValue(unsubscribe);

    initializeForegroundMessageListener(vi.fn());
    cleanupForegroundMessageListener();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it("리스너 없이 호출해도 예외가 발생하지 않는다", () => {
    expect(() => cleanupForegroundMessageListener()).not.toThrow();
  });
});
