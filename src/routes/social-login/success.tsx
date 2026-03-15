import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SocialCallbackPage } from "@/pages/social-callback/social-callback-page";

export const Route = createFileRoute("/social-login/success")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <SocialCallbackPage
      status="success"
      title="로그인 성공!"
      message="Google 계정으로 로그인이 완료되었습니다."
      onNavigate={() => navigate({ to: "/" })}
    />
  );
}
