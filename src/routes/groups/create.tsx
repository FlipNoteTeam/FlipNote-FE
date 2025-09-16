import CreateGroup from "@/pages/create-group";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/groups/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CreateGroup />;
}
