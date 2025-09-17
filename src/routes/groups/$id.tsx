import GroupDetail from "@/pages/group-detail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/groups/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <GroupDetail id={id} />;
}
