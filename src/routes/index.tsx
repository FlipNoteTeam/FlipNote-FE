import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col">
      <Link to="/auth/login">로그인 페이지</Link>
      <Link to="/auth/register">회원가입 페이지</Link>
      <Link to="/reset-password">비밀번호 재설정 페이지</Link>
      <Link to="/groups">그룹 리스트</Link>
      <Link to="/groups/create">그룹 생성</Link>
      <Link to="/groups/$id" params={{ id: "1" }}>
        그룹 상세
      </Link>
    </div>
  );
}
