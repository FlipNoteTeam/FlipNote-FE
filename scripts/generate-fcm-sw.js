import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경변수 로드
const mode = process.env.NODE_ENV || "development";
const envFile = path.resolve(__dirname, `../.env.${mode}`);

console.log(`\n🔧 Generating Service Worker for ${mode} mode...`);

// .env 파일 파싱
const parseEnvFile = (filePath) => {
  const config = {};
  if (!fs.existsSync(filePath)) return config;
  const content = fs.readFileSync(filePath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...values] = trimmed.split("=");
      if (key) config[key.trim()] = values.join("=").trim();
    }
  });
  return config;
};

// .env → .env.{mode} 순서로 읽어 병합 (mode 파일이 우선)
const baseEnvFile = path.resolve(__dirname, "../.env");
const baseConfig = parseEnvFile(baseEnvFile);
const modeConfig = fs.existsSync(envFile)
  ? parseEnvFile(envFile)
  : (() => { console.warn(`⚠️  Warning: ${envFile} not found, falling back to .env`); return {}; })();
const envConfig = { ...baseConfig, ...modeConfig };

// Firebase 설정 추출 (process.env도 최종 fallback)
const firebaseConfig = {
  apiKey: envConfig.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: envConfig.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: envConfig.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || "",
  measurementId: envConfig.VITE_FIREBASE_MEASUREMENT_ID || process.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

// Service Worker 템플릿
const swTemplate = `// Firebase Cloud Messaging Service Worker
// Auto-generated file - DO NOT EDIT MANUALLY
// Generated at: ${new Date().toISOString()}

// Firebase 라이브러리 import
importScripts(
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js"
);

// Firebase 설정
const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Messaging 인스턴스 가져오기
const messaging = firebase.messaging();

// 백그라운드 메시지 수신 처리
messaging.onBackgroundMessage((payload) => {
  console.log("백그라운드 메시지 수신:", payload);

  const notificationTitle = payload.notification?.title || "새 알림";
  const notificationOptions = {
    body: payload.notification?.body || "새로운 알림이 도착했습니다.",
    icon: payload.notification?.icon || "/icon-192x192.png",
    badge: "/badge-72x72.png",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 처리
self.addEventListener("notificationclick", (event) => {
  console.log("알림 클릭:", event);
  event.notification.close();

  // 알림 클릭 시 앱으로 이동
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 이미 열려있는 창이 있으면 포커스
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }

        // 열려있는 창이 없으면 새 창 열기
        if (clients.openWindow) {
          const url = event.notification.data?.url || "/";
          return clients.openWindow(url);
        }
      })
  );
});
`;

// public 디렉토리에 Service Worker 파일 생성
const outputPath = path.resolve(
  __dirname,
  "../public/firebase-messaging-sw.js"
);
fs.writeFileSync(outputPath, swTemplate, "utf-8");

console.log(`✅ Service Worker generated successfully at: ${outputPath}`);
console.log(`📦 Firebase Config:`, {
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId,
});
