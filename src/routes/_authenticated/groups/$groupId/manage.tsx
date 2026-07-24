import GroupManagePage from "@/pages/group-manage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/groups/$groupId/manage")({
  component: RouteComponent,
});

function RouteComponent() {
  const { groupId } = Route.useParams();
  return <GroupManagePage groupId={groupId} />;
}
