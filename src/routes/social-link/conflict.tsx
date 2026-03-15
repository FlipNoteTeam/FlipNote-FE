import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SocialCallbackPage } from "@/pages/social-callback/social-callback-page";
import useAuthStore from "@/stores/use-auth-store";

export const Route = createFileRoute("/social-link/conflict")({
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
      status="conflict"
      title="이미 연동된 계정"
      message="해당 Google 계정은 이미 다른 FlipNote 계정에 연동되어 있습니다."
      onNavigate={handleNavigate}
    />
  );
}
