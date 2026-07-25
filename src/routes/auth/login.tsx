import LoginPage from "@/pages/auth/ui/login-page";
import { requireGuest, waitForAuthInit } from "@/routes/__utils/-authGuard";
import { createFileRoute } from "@tanstack/react-router";

type LoginSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/auth/login")({
  component: RouteComponent,
  beforeLoad: async () => {
    await waitForAuthInit();
    requireGuest();
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
