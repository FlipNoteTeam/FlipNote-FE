import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import GroupDetail from "@/pages/group-detail";
import { authGuard } from "@/routes/__utils/authGuard";

export const Route = createFileRoute("/groups/$groupId")({
  beforeLoad: ({ context }) => {
    authGuard({ auth: context.auth, mode: "bypass" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { groupId } = Route.useParams();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isManage = pathname.endsWith("/manage");

  if (isManage) {
    return <Outlet />;
  }

  return (
    <>
      <GroupDetail id={groupId} />
      <Outlet />
    </>
  );
}
