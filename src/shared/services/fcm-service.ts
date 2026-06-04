import { notificationApi } from "@/shared/apis";
import {
  getFCMToken,
  deleteFCMToken,
  setupForegroundMessageListener,
} from "@/shared/libs/firebase";
import { notificationPermissionStore } from "@/shared/libs/notification-permission";

const FCM_TOKEN_STORAGE_KEY = "fcm_token";

const getStoredFCMToken = (): string | null =>
  localStorage.getItem(FCM_TOKEN_STORAGE_KEY);

const setStoredFCMToken = (token: string): void =>
  localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);

export const removeStoredFCMToken = (): void =>
  localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);

let foregroundUnsubscribe: (() => void) | null = null;

export const registerFCMToken = async (): Promise<boolean> => {
  try {
    const permissionGranted = await notificationPermissionStore.requestPermission();
    if (!permissionGranted) {
      return false;
    }

    const token = await getFCMToken();
    if (!token) {
      return false;
    }

    const storedToken = getStoredFCMToken();
    if (storedToken === token) {
      return true;
    }

    await notificationApi.registerFcmToken({ token });
    setStoredFCMToken(token);

    return true;
  } catch (error) {
    console.error("FCM 토큰 등록 중 오류 발생:", error);
    return false;
  }
};

/**
 * FCM 토큰 삭제 프로세스
 */
export const unregisterFCMToken = async (): Promise<boolean> => {
  try {
    const storedToken = getStoredFCMToken();
    if (!storedToken) {
      return true;
    }

    await deleteFCMToken();
    removeStoredFCMToken();

    return true;
  } catch (error) {
    console.error("FCM 토큰 삭제 중 오류 발생:", error);
    return false;
  }
};

/**
 * 포그라운드 메시지 리스너 초기화.
 * @param onNotificationReceived FCM 메시지 수신 시 실행할 콜백
 */
export const initializeForegroundMessageListener = (
  onNotificationReceived: () => void,
): void => {
  if (foregroundUnsubscribe) {
    foregroundUnsubscribe();
    foregroundUnsubscribe = null;
  }

  foregroundUnsubscribe = setupForegroundMessageListener(onNotificationReceived) ?? null;
};

/**
 * 포그라운드 메시지 리스너 정리.
 * 로그아웃 시 호출.
 */
export const cleanupForegroundMessageListener = (): void => {
  if (foregroundUnsubscribe) {
    foregroundUnsubscribe();
    foregroundUnsubscribe = null;
  }
};
