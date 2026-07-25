import useAuthStore from "@/stores/use-auth-store";
import axios, { type AxiosError } from "axios";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : import.meta.env.VITE_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// refresh를 시도하지 않아야 하는 URL 목록
const SKIP_REFRESH_URLS = [
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/token/refresh",
];

let refreshTokenPromise: Promise<void> | null = null;

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest) throw error;

    const isLoggedOut =
      useAuthStore.getState().isInitialized &&
      !useAuthStore.getState().isAuthenticated;

    // 401 에러 시 토큰 갱신 시도 (단, 특정 API는 제외)
    const shouldSkipRefresh = SKIP_REFRESH_URLS.some((url) =>
      originalRequest.url?.includes(url),
    );
    if (
      isLoggedOut ||
      shouldSkipRefresh ||
      error.response?.status !== 401 ||
      originalRequest._retry
    )
      throw error;

    // 요청당 재시도 1회로 제한하기 위해 재시도 플래그를 표시
    originalRequest._retry = true;

    try {
      // 겹쳐 있는 401은 최초 1건만 refresh를 발화하고 나머지는 그 promise를 기다린다
      refreshTokenPromise ??= useAuthStore
        .getState()
        .refreshToken()
        .then(() => {
          useAuthStore.getState().syncUser();
        })
        .finally(() => {
          refreshTokenPromise = null;
        });

      await refreshTokenPromise;

      // 원래 요청 재시도 (새 토큰이 쿠키에 설정되어 자동으로 포함됨)
      return apiClient(originalRequest);
    } catch {
      // 토큰 갱신 실패 시 로그아웃 처리
      useAuthStore.getState().clearUser();
      throw error;
    }
  },
);

export default apiClient;
