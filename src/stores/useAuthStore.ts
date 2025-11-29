import type { User } from "@/shared/apis";
import type { UserLoginRequest } from "@/shared/apis/auth";
import axios from "axios";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface AuthState {
  user: User | null;
  isInitialized: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
}

export interface AuthAction {
  login: (data: UserLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  syncUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  initializeAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState & AuthAction>()(
  devtools((set, get) => ({
    user: null,
    isInitialized: false,
    isInitializing: false,
    isLoggingIn: false,

    login: async (data) => {
      set({ isLoggingIn: true });
      try {
        const { authApi } = await import("@/shared/apis/auth");
        await authApi.login(data);
        await get().syncUser();
      } finally {
        set({ isLoggingIn: false });
      }
    },

    logout: async () => {
      const { authApi } = await import("@/shared/apis/auth");
      try {
        await authApi.logout();
      } catch (error) {
        console.log("로그아웃 실패:", error);
      }
      set({ user: null });
    },
    clearUser: () => set({ user: null }),

    refreshToken: async () => {
      // interceptor 무한루프 방지를 위해 axios를 직접 사용
      const baseURL = import.meta.env.DEV
        ? "/api"
        : import.meta.env.VITE_BASE_URL;
      // const baseURL = import.meta.env.VITE_BASE_URL;
      await axios.post(`${baseURL}/auth/token/refresh`, undefined, {
        withCredentials: true,
      });
    },

    syncUser: async () => {
      try {
        const { userApi } = await import("@/shared/apis/user");
        const userResponse = await userApi.getMyInfo();
        const user = userResponse.data?.data || null;
        set({ user });
      } catch (error) {
        console.log("사용자 정보 조회 실패:", error);
        set({ user: null });
      }
    },

    setUser: (user) => set({ user }),

    initializeAuth: async () => {
      if (get().isInitialized || get().isInitializing) return;

      set({ isInitializing: true });

      try {
        await get().refreshToken();
        await get().syncUser();
        set({ isInitialized: true, isInitializing: false });
      } catch (error) {
        console.log("인증 초기화 실패:", error);
        set({ user: null, isInitialized: true, isInitializing: false });
      }
    },
  }))
);

export default useAuthStore;
