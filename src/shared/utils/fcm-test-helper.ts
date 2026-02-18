/**
 * FCM 테스트 헬퍼 유틸리티
 * 브라우저 콘솔에서 FCM 동작을 쉽게 테스트할 수 있는 함수들
 */

import { getFCMToken } from "@/shared/libs/firebase";

/**
 * FCM 토큰 확인
 */
export const checkFCMToken = (): void => {
  const storedToken = localStorage.getItem("fcm_token");

  console.group("🔍 FCM 토큰 상태");
  console.log("저장된 토큰:", storedToken || "없음");
  console.log(
    "알림 권한:",
    "Notification" in window ? Notification.permission : "지원 안 됨"
  );
  console.groupEnd();
};

/**
 * 새 FCM 토큰 발급 및 출력
 */
export const getNewFCMToken = async (): Promise<void> => {
  console.log("🔄 FCM 토큰 발급 시작...");

  try {
    const token = await getFCMToken();

    console.group("✅ FCM 토큰 발급 완료");
    console.log("토큰:", token);
    console.log("Firebase Console에서 테스트 메시지 전송 시 사용하세요:");
    console.log("%c" + token, "color: #4CAF50; font-weight: bold");
    console.groupEnd();
  } catch (error) {
    console.error("❌ FCM 토큰 발급 실패:", error);
  }
};

/**
 * Service Worker 상태 확인
 */
export const checkServiceWorker = async (): Promise<void> => {
  if (!("serviceWorker" in navigator)) {
    console.error("❌ Service Worker를 지원하지 않는 브라우저입니다.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    console.group("🔧 Service Worker 상태");
    if (registration) {
      console.log("✅ 등록됨");
      console.log("Scope:", registration.scope);
      console.log("Active:", registration.active?.state);
      console.log("Waiting:", registration.waiting?.state);
      console.log("Installing:", registration.installing?.state);
    } else {
      console.log("❌ 등록되지 않음");
    }
    console.groupEnd();
  } catch (error) {
    console.error("❌ Service Worker 확인 실패:", error);
  }
};

/**
 * FCM 전체 상태 진단
 */
export const diagnoseFCM = async (): Promise<void> => {
  console.log("🏥 FCM 상태 진단 시작...\n");

  // 1. 브라우저 지원 확인
  console.group("1️⃣ 브라우저 지원");
  console.log(
    "Service Worker:",
    "serviceWorker" in navigator ? "✅ 지원" : "❌ 미지원"
  );
  console.log(
    "Notification:",
    "Notification" in window ? "✅ 지원" : "❌ 미지원"
  );
  console.groupEnd();

  // 2. 알림 권한
  console.group("2️⃣ 알림 권한");
  if ("Notification" in window) {
    const permission = Notification.permission;
    const emoji =
      permission === "granted" ? "✅" : permission === "denied" ? "❌" : "⚠️";
    console.log(`${emoji} 상태: ${permission}`);

    if (permission !== "granted") {
      console.log("💡 권한을 요청하려면: Notification.requestPermission()");
    }
  }
  console.groupEnd();

  // 3. Service Worker 상태
  await checkServiceWorker();

  // 4. FCM 토큰
  console.group("4️⃣ FCM 토큰");
  const storedToken = localStorage.getItem("fcm_token");
  if (storedToken) {
    console.log("✅ 저장된 토큰 있음");
    console.log("토큰:", storedToken);
  } else {
    console.log("⚠️ 저장된 토큰 없음");
    console.log("💡 토큰을 발급받으려면: getNewFCMToken()");
  }
  console.groupEnd();

  console.log("\n✨ 진단 완료!");
};

/**
 * 테스트 메시지 전송 가이드 출력
 */
export const showTestGuide = (): void => {
  console.log(`
📱 FCM 테스트 가이드

1. Firebase Console에서 테스트:
   - https://console.firebase.google.com 접속
   - 프로젝트 선택 > Messaging > Send test message
   - 발급받은 FCM 토큰 입력
   - 제목, 본문 작성 후 전송

2. 포그라운드 테스트:
   - 앱이 열려있는 상태에서 메시지 전송
   - 콘솔에 "📩 새 메시지 수신" 로그 확인
   - 브라우저 알림 팝업 확인

3. 백그라운드 테스트:
   - 앱 탭을 다른 탭으로 전환하거나 최소화
   - 메시지 전송
   - 브라우저 알림 팝업 확인

4. 유용한 함수들:
   - checkFCMToken()        : 토큰 상태 확인
   - getNewFCMToken()       : 새 토큰 발급
   - checkServiceWorker()   : Service Worker 상태 확인
   - diagnoseFCM()          : 전체 상태 진단
  `);
};

// 전역 객체에 테스트 함수 추가 (개발 환경에서만)
if (import.meta.env.DEV) {
  window.fcmTest = {
    checkToken: checkFCMToken,
    getToken: getNewFCMToken,
    checkSW: checkServiceWorker,
    diagnose: diagnoseFCM,
    guide: showTestGuide,
  };

  console.log(`
🧪 FCM 테스트 도구가 준비되었습니다!
사용 방법: window.fcmTest

사용 가능한 명령어:
  - fcmTest.checkToken()  : 토큰 상태 확인
  - fcmTest.getToken()    : 새 토큰 발급
  - fcmTest.checkSW()     : Service Worker 확인
  - fcmTest.diagnose()    : 전체 진단
  - fcmTest.guide()       : 테스트 가이드
  `);
}
