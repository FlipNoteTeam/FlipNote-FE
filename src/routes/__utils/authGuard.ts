import { type AuthState } from "@/stores/useAuthStore";
import { redirect } from "@tanstack/react-router";

interface Props {
  auth: AuthState;
  mode?: "protected" | "non-protected" | "bypass";
}
export const authGuard = ({ auth, mode }: Props) => {
  const isAuthenticated = auth.accessToken && auth.accessToken.length;
  switch (mode) {
    case "bypass":
      return;
    case "protected":
      if (!isAuthenticated) {
        throw redirect({
          to: "/auth/login",
          search: {
            redirect: location.href,
          },
          replace: true,
        });
      }
      return;
    case "non-protected":
      if (isAuthenticated) {
        history.back();
      }
      return;
  }
};
