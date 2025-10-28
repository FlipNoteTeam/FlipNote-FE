import type { User } from "@/shared/apis";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isInitialized: boolean;
  isInitializing: boolean;
}

export interface AuthAction {
  hasAccessToken: () => boolean;
  removeAccessToken: () => void;
  updateAccessToken: (accessToken: string) => void;
  setUser: (user: User | null) => void;
  initializeAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState & AuthAction>()(
  devtools((set, get) => ({
    accessToken: null,
    user: null,
    isInitialized: false,
    isInitializing: false,
    hasAccessToken: () => !!get().accessToken,
    removeAccessToken: () => set({ accessToken: null, user: null }),
    updateAccessToken: (accessToken) => set({ accessToken }),
    setUser: (user) => set({ user }),
    initializeAuth: async () => {
      if (get().isInitialized || get().isInitializing) return;

      set({ isInitializing: true });

      try {
        const { authApi } = await import("@/shared/apis/auth");
        const response = await authApi.refreshToken();
        const accessToken = response.data?.data?.accessToken;

        if (!accessToken) {
          set({ accessToken: null, user: null, isInitialized: true, isInitializing: false });
          return;
        }

        set({ accessToken });

        const { userApi } = await import("@/shared/apis/user");
        const userResponse = await userApi.getMyInfo();
        const user = userResponse.data?.data || null;

        set({ user, isInitialized: true, isInitializing: false });
      } catch (error) {
        console.log("인증 초기화 실패:", error);
        set({ accessToken: null, user: null, isInitialized: true, isInitializing: false });
      }
    },
  }))
);

export default useAuthStore;
