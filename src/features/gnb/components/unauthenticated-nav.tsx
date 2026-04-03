import { Link } from "@tanstack/react-router";

const UnauthenticatedNav = () => {
  return (
    <ul className="flex items-center space-x-4">
      <li className="text-sm underline underline-offset-2">
        <Link to="/auth/login">로그인</Link>
      </li>
      <li className="text-sm underline underline-offset-2">
        <Link to="/auth/register">회원가입</Link>
      </li>
    </ul>
  );
};

export default UnauthenticatedNav;
