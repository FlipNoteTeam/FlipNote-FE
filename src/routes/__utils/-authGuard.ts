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
