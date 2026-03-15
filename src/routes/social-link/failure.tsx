import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SocialCallbackPage } from "@/pages/social-callback/social-callback-page";
import useAuthStore from "@/stores/use-auth-store";

export const Route = createFileRoute("/social-link/failure")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    const { user } = useAuthStore.getState();
    if (user) {
      navigate({ to: "/user/$userId", params: { userId: String(user.userId) } });
    } else {
      navigate({ to: "/" });
    }
  };

  return (
    <SocialCallbackPage
      status="failure"
      title="계정 연동 실패"
      message="Google 계정 연동 중 문제가 발생했습니다."
      onNavigate={handleNavigate}
    />
  );
}
