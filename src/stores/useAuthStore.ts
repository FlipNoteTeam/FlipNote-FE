import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface AuthState {
  accessToken: string | null;
  isInitialized: boolean;
}

export interface AuthAction {
  hasAccessToken: () => boolean;
  removeAccessToken: () => void;
  updateAccessToken: (accessToken: string) => void;
  initializeAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState & AuthAction>()(
  devtools((set, get) => ({
    accessToken: null,
    isInitialized: false,
    hasAccessToken: () => !!get().accessToken,
    removeAccessToken: () => set({ accessToken: null }),
    updateAccessToken: (accessToken) => set({ accessToken }),
    initializeAuth: async () => {
      try {
        const { authApi } = await import("@/shared/apis/auth");
        const response = await authApi.refreshToken();
        if (response.data?.data?.accessToken) {
          set({ accessToken: response.data.data.accessToken, isInitialized: true });
        } else {
          set({ isInitialized: true });
        }
      } catch (error) {
        console.log('토큰 갱신 실패:', error);
        set({ isInitialized: true });
      }
    },
  }))
);

export default useAuthStore;
