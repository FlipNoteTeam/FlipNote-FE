import Home from "@/pages/home";
import BaseLayout from "@/shared/layouts/base-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <BaseLayout>
      <Home />
    </BaseLayout>
  );
}
