import GroupManagePage from "@/pages/group-manage";
import { authGuard } from "@/routes/__utils/authGuard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/groups/$groupId/manage")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    authGuard({ auth: context.auth, mode: "protected" });
  },
});

function RouteComponent() {
  const { groupId } = Route.useParams();
  return <GroupManagePage groupId={groupId} />;
}
