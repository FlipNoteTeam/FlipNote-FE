import UserInfoPage from "@/pages/user/info";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/user/$userId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { userId } = Route.useParams();
  return <UserInfoPage userId={userId} />;
}
