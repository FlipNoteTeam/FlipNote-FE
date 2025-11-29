import { type AuthState } from "@/stores/useAuthStore";
import { redirect } from "@tanstack/react-router";

interface Props {
  auth: AuthState | undefined;
  mode?: "protected" | "non-protected" | "bypass";
}
export const authGuard = ({ auth, mode }: Props) => {
  const isAuthenticated = auth && auth.isInitialized && Boolean(auth.user);

  switch (mode) {
    case "bypass":
      return;
    case "protected":
      if (!isAuthenticated) {
        const href = typeof window !== "undefined" ? window.location.href : "/";

        throw redirect({
          to: "/auth/login",
          search: {
            redirect: href,
          },
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
