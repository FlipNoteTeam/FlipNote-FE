import Dashboard from "@/pages/dashboard";
import BaseLayout from "@/shared/layouts/base-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "대시보드 | FlipNote" },
      {
        name: "description",
        content: "나의 학습 현황과 그룹 정보를 한눈에 확인하세요",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <BaseLayout>
      <Dashboard />
    </BaseLayout>
  );
}
