import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/App";

// Service Worker 등록 및 알림 권한 요청
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then(async (registration) => {
      console.log("✅ Service Worker 등록 성공:", registration.scope);

      // 알림 권한 확인 및 요청
      if ("Notification" in window) {
        const permission = Notification.permission;

        if (permission === "default") {
          // 권한이 아직 설정되지 않은 경우 요청
          const result = await Notification.requestPermission();
          if (result === "granted") {
            console.log("✅ 알림 권한 허용됨");
          } else {
            console.warn("⚠️ 알림 권한 거부됨");
          }
        } else if (permission === "denied") {
          console.warn("⚠️ 알림 권한이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.");
        } else {
          console.log("✅ 알림 권한이 이미 허용되어 있습니다.");
        }
      }
    })
    .catch((error) => {
      console.error("❌ Service Worker 등록 실패:", error);
    });
}

// 개발 환경에서 FCM 테스트 도구 로드
if (import.meta.env.DEV) {
  import("@/shared/utils/fcm-test-helper");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
