import { authGuard } from "@/routes/__utils/authGuard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/can-access-only-user")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    authGuard({ auth: context.auth, mode: "protected" });
  },
});

function RouteComponent() {
  return <div>이페이지는 로그인한 유저에게만 노출되는 화면입니다.</div>;
}
