import Login from "@/pages/auth/login";
import { authGuard } from "@/routes/__utils/authGuard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/login")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    authGuard({ auth: context.auth, mode: "non-protected" });
  },
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || undefined,
    };
  },
});

function RouteComponent() {
  return <Login />;
}
