import useAuthStore from "@/stores/useAuthStore";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import type { FileRouteTypes } from "@/routeTree.gen";

type NavItem = {
  name: string;
  to: FileRouteTypes["to"];
  params?: Record<string, unknown>;
  hidden?: boolean;

  beforeIcon?: React.ReactNode;
  afterIcon?: React.ReactNode;
};

const NavItems = () => {
  const user = useAuthStore((state) => state.user);

  const navItems: NavItem[] = useMemo(
    () => [
      {
        name: "그룹 목록",
        to: "/group-list",
      },
      { name: "카드셋 목록", to: "/cardset-list" },
      {
        name: "마이페이지",
        to: "/user/$userId",
        params: { userId: `${user?.userId}` },
        hidden: !user,
      },
    ],
    [user]
  );

  return (
    <ul className="flex gap-4 justify-center">
      {navItems.map((item) =>
        item.hidden ? null : (
          <li className="text-md" key={item.name}>
            <Link
              to={item.to}
              params={item?.params}
              className="font-semibold text-md rounded-xl px-4 py-2 hover:bg-accent"
            >
              {item.name}
            </Link>
          </li>
        )
      )}
    </ul>
  );
};

export default NavItems;
