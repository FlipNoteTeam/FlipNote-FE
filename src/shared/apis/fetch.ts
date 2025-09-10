import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : import.meta.env.VITE_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Cookie 헬퍼 함수
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // 쿠키에서 토큰을 가져와서 헤더에 추가
    const token = getCookie("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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
