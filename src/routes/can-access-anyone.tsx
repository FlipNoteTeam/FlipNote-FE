import { authGuard } from "@/routes/__utils/authGuard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/can-access-anyone")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    authGuard({ auth: context.auth, mode: "bypass" });
  },
});

function RouteComponent() {
  return (
    <div>
      로그인한 유저/ 로그인하지 않은 누군가 모두가 접근 가능한 페이지입니다.
    </div>
  );
}
