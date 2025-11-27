import { initializeApp } from "firebase/app";
import { getMessaging, getToken, deleteToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Messaging 인스턴스 (브라우저 환경에서만)
let messaging: ReturnType<typeof getMessaging> | null = null;

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Firebase Messaging 초기화 실패:", error);
  }
}

/**
 * FCM 토큰 발급
 */
export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn("Firebase Messaging이 초기화되지 않았습니다.");
    return null;
  }

  try {
    // Service Worker 등록 확인
    const registration = await navigator.serviceWorker.ready;

    // FCM 토큰 발급
    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("FCM 토큰 발급 성공:", token);
      return token;
    } else {
      console.warn("FCM 토큰 발급 실패: 알림 권한을 확인하세요.");
      return null;
    }
  } catch (error) {
    console.error("FCM 토큰 발급 중 오류:", error);
    return null;
  }
};

/**
 * FCM 토큰 삭제
 */
export const deleteFCMToken = async (): Promise<boolean> => {
  if (!messaging) {
    console.warn("Firebase Messaging이 초기화되지 않았습니다.");
    return false;
  }

  try {
    await deleteToken(messaging);
    console.log("FCM 토큰 삭제 성공");
    return true;
  } catch (error) {
    console.error("FCM 토큰 삭제 중 오류:", error);
    return false;
  }
};

/**
 * 알림 권한 요청
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.warn("이 브라우저는 알림을 지원하지 않습니다.");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("알림 권한 요청 중 오류:", error);
    return false;
  }
};
