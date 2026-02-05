import Home from "@/pages/home";
import BaseLayout from "@/shared/layouts/base-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "FlipNote" },
      {
        name: "description",
        content: "FlipNote - 플래시카드를 활용한 효과적인 학습 플랫폼",
      },
      { property: "og:title", content: "FlipNote" },
      {
        property: "og:description",
        content: "FlipNote - 플래시카드를 활용한 효과적인 학습 플랫폼",
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <BaseLayout>
      <Home />
    </BaseLayout>
  );
}
