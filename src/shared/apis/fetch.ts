import useAuthStore from "@/stores/useAuthStore";
import axios, { type InternalAxiosRequestConfig } from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : import.meta.env.VITE_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// OAuth 전용 클라이언트 (프록시를 거치지 않음)
export const oauthClient = axios.create({
  baseURL: import.meta.env.DEV
    ? "https://api.flipnote.site/v1"
    : import.meta.env.VITE_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor (공통)
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  // 쿠키에서 토큰을 가져와서 헤더에 추가
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
};

const requestErrorInterceptor = (error: unknown) => {
  return Promise.reject(error);
};

// apiClient에 interceptor 적용
apiClient.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

// oauthClient에도 동일한 interceptor 적용
oauthClient.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 시 토큰 갱신 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // refresh token은 httpOnly 쿠키로 자동 전송됨
        axios.post(
          "/api/auth/refresh",
          {},
          {
            withCredentials: true,
          }
        );

        // 서버에서 새로운 accessToken을 쿠키로 설정해줌
        // 원래 요청 재시도 (새 토큰이 쿠키에 설정되어 자동으로 포함됨)
        return apiClient(originalRequest);
      } catch {
        // 토큰 갱신 실패 시 로그아웃 처리
        // 서버에서 쿠키 클리어 API 호출 후 리다이렉트
        try {
          await axios.post("/api/auth/logout", {}, { withCredentials: true });
        } catch {
          // 로그아웃 API 실패해도 리다이렉트
        }
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
