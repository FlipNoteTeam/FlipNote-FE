import GroupList from "@/pages/group-list";
import { authGuard } from "@/routes/__utils/authGuard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/group-list")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    authGuard({ auth: context.auth, mode: "protected" });
  },
  head: () => ({
    meta: [
      { title: "그룹 목록 | FlipNote" },
      {
        name: "description",
        content: "관심 있는 학습 그룹을 찾아보세요",
      },
    ],
  }),
});

function RouteComponent() {
  return <GroupList />;
}
