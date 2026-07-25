import useAuthStore from "@/stores/use-auth-store";
import { redirect, type ParsedLocation } from "@tanstack/react-router";

export const waitForAuthInit = () => {
  if (useAuthStore.getState().isInitialized) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.isInitialized) {
        unsubscribe();
        resolve();
      }
    });
  });
};

export const requireAuth = ({ location }: { location: ParsedLocation }) => {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;

  if (!isAuthenticated)
    throw redirect({
      to: "/auth/login",
      search: { redirect: location.href },
      replace: true,
    });
};

export const requireGuest = () => {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;

  if (isAuthenticated) {
    throw redirect({
      to: "/",
    });
  }
};

/**
 * 로그인 후 이동할 redirect 값이 내부 경로일 때만 허용한다.
 * 절대 URL(https://...)과 프로토콜-상대 경로(//, /\)는 외부로 새어나갈 수
 * 있으므로 차단하고 "/"로 폴백한다(open redirect 방지).
 */
export const sanitizeRedirect = (redirect: string | undefined): string => {
  if (!redirect) return "/";
  if (!redirect.startsWith("/")) return "/";
  if (redirect.startsWith("//") || redirect.startsWith("/\\")) return "/";
  return redirect;
};
