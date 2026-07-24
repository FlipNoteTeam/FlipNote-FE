import {
  createFileRoute,
  Navigate,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { requireAuth, waitForAuthInit } from "../__utils/-authGuard";
import useAuthStore from "@/stores/use-auth-store";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
  beforeLoad: async ({ location }) => {
    await waitForAuthInit();
    requireAuth({ location });
  },
});

function AuthenticatedLayout() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const href = useRouterState({ select: (state) => state.location.href });

  if (!isInitialized) return null;

  if (!isAuthenticated)
    return <Navigate to="/auth/login" search={{ redirect: href }} replace />;

  return <Outlet />;
}
