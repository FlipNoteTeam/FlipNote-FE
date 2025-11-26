import { createFileRoute } from "@tanstack/react-router";
import RegisterPage from "@/pages/auth/ui/RegisterPage";
import { authGuard } from "@/routes/__utils/authGuard";

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    authGuard({ auth: context.auth, mode: "non-protected" });
  },
});

function RouteComponent() {
  return <RegisterPage />;
}
