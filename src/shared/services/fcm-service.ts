import { notificationApi } from "@/shared/apis";
import { NOTIFICATIONS_QUERY_KEY } from "@/shared/apis/notification";
import { queryClient } from "@/shared/lib/query-client";
import {
  getFCMToken,
  deleteFCMToken,
  requestNotificationPermission,
  setupForegroundMessageListener,
} from "@/shared/libs/firebase";

const FCM_TOKEN_STORAGE_KEY = "fcm_token";

const getStoredFCMToken = (): string | null =>
  localStorage.getItem(FCM_TOKEN_STORAGE_KEY);

const setStoredFCMToken = (token: string): void =>
  localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);

const removeStoredFCMToken = (): void =>
  localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);

/** Bug 7: 등록된 foreground listener의 unsubscribe. 재로그인 시 중복 방지용. */
let foregroundUnsubscribe: (() => void) | null = null;

/**
 * FCM 토큰 등록 프로세스.
 * Bug 6: 매 호출마다 getToken() 으로 최신 토큰을 가져와 localStorage와 비교.
 * 토큰이 변경됐거나 없으면 서버에 새로 등록한다.
 */
export const registerFCMToken = async (): Promise<boolean> => {
  try {
    const permissionGranted = await requestNotificationPermission();
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
 * Bug 7: 이전 listener를 먼저 cleanup 후 재등록해 중복 방지.
 * Bug 4: 메시지 수신 시 알림 쿼리 invalidate.
 */
export const initializeForegroundMessageListener = (): void => {
  if (foregroundUnsubscribe) {
    foregroundUnsubscribe();
    foregroundUnsubscribe = null;
  }

  foregroundUnsubscribe = setupForegroundMessageListener(() => {
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
  });
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
