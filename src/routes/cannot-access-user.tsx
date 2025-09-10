import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cannot-access-user")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>이페이지는 로그인한 유저에게는 접근되면 안되는 페이지입니다.</div>
  );
}
