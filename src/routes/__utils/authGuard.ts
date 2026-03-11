import { type AuthState } from "@/stores/use-auth-store";
import useAuthStore from "@/stores/use-auth-store";
import { redirect } from "@tanstack/react-router";

interface Props {
  auth: AuthState | undefined;
  mode?: "protected" | "non-protected" | "bypass";
}

export const authGuard = async ({ mode }: Props) => {
  if (mode === "bypass") return;

  // isInitialized 될 때까지 대기
  if (!useAuthStore.getState().isInitialized) {
    await new Promise<void>((resolve) => {
      const unsubscribe = useAuthStore.subscribe((state) => {
        if (state.isInitialized) {
          unsubscribe();
          resolve();
        }
      });
      // subscribe 사이에 이미 완료된 경우 처리
      if (useAuthStore.getState().isInitialized) {
        unsubscribe();
        resolve();
      }
    });
  }

  const { isInitialized, user } = useAuthStore.getState();
  const isAuthenticated = isInitialized && Boolean(user);

  switch (mode) {
    case "protected":
      if (!isAuthenticated) {
        const href = typeof window !== "undefined" ? window.location.href : "/";
        throw redirect({
          to: "/auth/login",
          search: { redirect: href },
          replace: true,
        });
      }
      return;
    case "non-protected":
      if (isAuthenticated) {
        throw redirect({ to: "/", replace: true });
      }
      return;
  }
};
