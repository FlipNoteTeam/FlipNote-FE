import GroupDetail from "@/pages/group-detail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/groups/$groupId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { groupId } = Route.useParams();
  return <GroupDetail id={groupId} />;
}
