import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cardsets/editor")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/cardsets/editor"!</div>;
}
