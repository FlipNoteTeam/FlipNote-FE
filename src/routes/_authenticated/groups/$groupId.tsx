import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import GroupDetail from "@/pages/group-detail";

export const Route = createFileRoute("/_authenticated/groups/$groupId")({
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
