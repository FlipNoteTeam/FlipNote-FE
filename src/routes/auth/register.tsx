import { createFileRoute } from "@tanstack/react-router";
import Register from "@/pages/auth/register";
import { authGuard } from "@/routes/__utils/authGuard";

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    authGuard({ auth: context.auth, mode: "non-protected" });
  },
});

function RouteComponent() {
  return <Register />;
}
