import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface AuthState {
  accessToken: string | null;
}

export interface AuthAction {
  hasAccessToken: () => boolean;
  removeAccessToken: () => void;
  updateAccessToken: (accessToken: string) => void;
}

const useAuthStore = create<AuthState & AuthAction>()(
  devtools((set, get) => ({
    accessToken: null,
    hasAccessToken: () => !!get().accessToken,
    removeAccessToken: () => set({ accessToken: null }),
    updateAccessToken: (accessToken) => set({ accessToken }),
  }))
);

export default useAuthStore;
