import { notificationApi } from "@/shared/apis";
import {
  getFCMToken,
  deleteFCMToken,
  requestNotificationPermission,
} from "@/shared/libs/firebase";

const FCM_TOKEN_STORAGE_KEY = "fcm_token";

/**
 * 로컬 스토리지에서 FCM 토큰 가져오기
 */
const getStoredFCMToken = (): string | null => {
  return localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
};

/**
 * 로컬 스토리지에 FCM 토큰 저장
 */
const setStoredFCMToken = (token: string): void => {
  localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
};

/**
 * 로컬 스토리지에서 FCM 토큰 삭제
 */
const removeStoredFCMToken = (): void => {
  localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
};

/**
 * FCM 토큰 등록 프로세스
 * 1. 알림 권한 요청
 * 2. FCM 토큰 발급
 * 3. 서버에 토큰 등록
 * 4. 로컬 스토리지에 토큰 저장
 */
export const registerFCMToken = async (): Promise<boolean> => {
  try {
    // 이미 저장된 토큰이 있는지 확인
    const storedToken = getStoredFCMToken();
    if (storedToken) {
      console.log("이미 등록된 FCM 토큰이 있습니다.");
      // 기존 토큰을 서버에 재등록 (토큰 리프레시 시 필요)
      await notificationApi.registerFcmToken({ token: storedToken });
      return true;
    }

    // 1. 알림 권한 요청
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      console.warn("알림 권한이 거부되었습니다.");
      return false;
    }

    // 2. FCM 토큰 발급
    const token = await getFCMToken();
    if (!token) {
      console.error("FCM 토큰 발급에 실패했습니다.");
      return false;
    }

    // 3. 서버에 토큰 등록
    await notificationApi.registerFcmToken({ token });
    console.log("FCM 토큰이 서버에 등록되었습니다.");

    // 4. 로컬 스토리지에 토큰 저장
    setStoredFCMToken(token);

    return true;
  } catch (error) {
    console.error("FCM 토큰 등록 중 오류 발생:", error);
    return false;
  }
};

/**
 * FCM 토큰 삭제 프로세스
 * 1. Firebase에서 토큰 삭제
 * 2. 로컬 스토리지에서 토큰 삭제
 */
export const unregisterFCMToken = async (): Promise<boolean> => {
  try {
    // 저장된 토큰 확인
    const storedToken = getStoredFCMToken();
    if (!storedToken) {
      console.log("삭제할 FCM 토큰이 없습니다.");
      return true;
    }

    // 1. Firebase에서 토큰 삭제
    await deleteFCMToken();

    // 2. 로컬 스토리지에서 토큰 삭제
    removeStoredFCMToken();

    console.log("FCM 토큰이 삭제되었습니다.");
    return true;
  } catch (error) {
    console.error("FCM 토큰 삭제 중 오류 발생:", error);
    return false;
  }
};
