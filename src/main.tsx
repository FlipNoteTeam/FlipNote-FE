import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/App";

// Service Worker 등록
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .catch((error) => {
      console.error("❌ Service Worker 등록 실패:", error);
    });
}

// 개발 환경에서 FCM 테스트 도구 로드
if (import.meta.env.DEV) {
  import("@/shared/utils/fcm-test-helper");
}

async function prepare() {
  if (import.meta.env.VITE_USE_MOCK === "true") {
    const { worker } = await import("@/mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
}

prepare().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
