import LoginPage from "@/pages/auth/ui/login-page";
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
  head: () => ({
    meta: [
      { title: "로그인 | FlipNote" },
      {
        name: "description",
        content: "FlipNote에 로그인하여 학습을 시작하세요",
      },
    ],
  }),
});

function RouteComponent() {
  return <LoginPage />;
}
