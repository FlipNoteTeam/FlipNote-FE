import { createFileRoute } from "@tanstack/react-router";
import RegisterPage from "@/pages/auth/ui/RegisterPage";
import { authGuard } from "@/routes/__utils/authGuard";

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    authGuard({ auth: context.auth, mode: "non-protected" });
  },
  head: () => ({
    meta: [
      { title: "회원가입 | FlipNote" },
      {
        name: "description",
        content: "FlipNote에 가입하여 플래시카드 학습을 시작하세요",
      },
    ],
  }),
});

function RouteComponent() {
  return <RegisterPage />;
}
