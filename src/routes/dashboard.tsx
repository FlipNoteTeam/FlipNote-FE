import Dashboard from "@/pages/dashboard";
import BaseLayout from "@/shared/layouts/base-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <BaseLayout>
      <Dashboard />
    </BaseLayout>
  );
}
