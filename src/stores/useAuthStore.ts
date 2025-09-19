import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface AuthState {
  accessToken: string | null;
  isInitialized: boolean;
  isInitializing: boolean;
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
    isInitializing: false,
    hasAccessToken: () => !!get().accessToken,
    removeAccessToken: () => set({ accessToken: null }),
    updateAccessToken: (accessToken) => set({ accessToken }),
    initializeAuth: async () => {
      if (get().isInitialized || get().isInitializing) return;

      set({ isInitializing: true });
      try {
        const { authApi } = await import("@/shared/apis/auth");
        const response = await authApi.refreshToken();
        if (response.data?.data?.accessToken) {
          set({
            accessToken: response.data.data.accessToken,
            isInitialized: true,
            isInitializing: false,
          });
        } else {
          set({
            accessToken: null,
            isInitialized: true,
            isInitializing: false,
          });
        }
      } catch (error) {
        console.log("토큰 갱신 실패:", error);
        set({ accessToken: null, isInitialized: true, isInitializing: false });
      }
    },
  }))
);

export default useAuthStore;
