import Login from "@/pages/auth/login";
import { authGuard } from "@/routes/__utils/authGuard";
import { createFileRoute } from "@tanstack/react-router";

type LoginSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/auth/login")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    authGuard({ auth: context.auth, mode: "non-protected" });
  },
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      redirect:
        typeof search.redirect === "string" ? search.redirect : undefined,
    };
  },
});

function RouteComponent() {
  return <Login />;
}
