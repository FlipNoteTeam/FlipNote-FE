import type { User } from "@/shared/apis";
import axios from "axios";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface AuthState {
  user: User | null;
  isInitialized: boolean;
  isInitializing: boolean;
  isAuthenticated: boolean;
}

export interface AuthAction {
  setUser: (user: User | null) => void;
  clearUser: () => void;
  syncUser: () => Promise<void>;
  refreshToken: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState & AuthAction>()(
  devtools((set, get) => ({
    user: null,
    isInitialized: false,
    isInitializing: false,
    isAuthenticated: false,

    setUser: (user) => set({ user, isAuthenticated: user !== null }),

    clearUser: () => set({ user: null, isAuthenticated: false }),

    syncUser: async () => {
      try {
        const { userApi } = await import("@/shared/apis/user");
        const userResponse = await userApi.getMyInfo();
        const user = userResponse.data?.data || null;
        get().setUser(user);
      } catch (error) {
        console.error("사용자 정보 조회 실패:", error);
        get().clearUser();
      }
    },

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

    initializeAuth: async () => {
      if (get().isInitialized || get().isInitializing) return;

      set({ isInitializing: true });

      try {
        await get().refreshToken();
        await get().syncUser();

        set({
          isInitialized: true,
          isInitializing: false,
        });
      } catch (error) {
        console.log("인증 초기화 실패:", error);
        set({
          user: null,
          isInitialized: true,
          isInitializing: false,
          isAuthenticated: false,
        });
      }
    },
  }))
);

export default useAuthStore;
