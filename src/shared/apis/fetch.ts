import useAuthStore from "@/stores/use-auth-store";
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : import.meta.env.VITE_BASE_URL,
  // baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // refresh를 시도하지 않아야 하는 URL 목록
    const skipRefreshUrls = [
      "/auth/login",
      "/auth/register",
      "/auth/logout",
      "/auth/refresh",
    ];
    const shouldSkipRefresh = skipRefreshUrls.some((url) =>
      originalRequest.url?.includes(url),
    );

    // 401 에러 시 토큰 갱신 시도 (단, 특정 API는 제외)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkipRefresh
    ) {
      originalRequest._retry = true;

      try {
        // refresh token API 호출 (httpOnly 쿠키로 자동 전송됨)
        await useAuthStore.getState().refreshToken();

        // 원래 요청 재시도 (새 토큰이 쿠키에 설정되어 자동으로 포함됨)
        const result = apiClient(originalRequest);

        // 원래 요청 후 user 정보를 background에서 갱신
        useAuthStore.getState().syncUser();

        return result;
      } catch {
        // 토큰 갱신 실패 시 로그아웃 처리
        useAuthStore.getState().clearUser();
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;

// export const nestClient = axios.create({
//   baseURL:"http://localhost:3000"
// })
