import GroupList from "@/pages/group-list";
import { authGuard } from "@/routes/__utils/authGuard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/group-list")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    authGuard({ auth: context.auth, mode: "protected" });
  },
});

function RouteComponent() {
  return <GroupList />;
}
