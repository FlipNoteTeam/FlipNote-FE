// Firebase Cloud Messaging Service Worker Template
// This file is a template and will be processed during build

// Firebase 라이브러리 import
importScripts(
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js"
);

// Firebase 설정 (빌드 시 환경변수에서 주입됨)
const firebaseConfig = __FIREBASE_CONFIG__;

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
