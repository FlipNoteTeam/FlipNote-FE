import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SocialCallbackPage } from "@/pages/social-callback/social-callback-page";
import useAuthStore from "@/stores/use-auth-store";

export const Route = createFileRoute("/social-link/success")({
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
      status="success"
      title="계정 연동 성공!"
      message="Google 계정이 성공적으로 연동되었습니다."
      onNavigate={handleNavigate}
    />
  );
}
