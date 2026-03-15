import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SocialCallbackPage } from "@/pages/social-callback/social-callback-page";

export const Route = createFileRoute("/social-login/failure")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <SocialCallbackPage
      status="failure"
      title="로그인 실패"
      message="Google 로그인 중 문제가 발생했습니다. 다시 시도해주세요."
      onNavigate={() => navigate({ to: "/auth/login" })}
    />
  );
}
