import useAuthStore from "@/stores/useAuthStore";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import type { FileRouteTypes } from "@/routeTree.gen";

import groupLogo from "@/assets/group.png";
import cardLogo from "@/assets/card.png";
import mypageLogo from "@/assets/mypage.png";

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
        beforeIcon: <img src={groupLogo} width={30} />,
        to: "/group-list",
      },
      {
        name: "카드셋 목록",
        beforeIcon: <img src={cardLogo} width={30} />,
        to: "/cardset-list",
      },
      {
        name: "마이페이지",
        beforeIcon: <img src={mypageLogo} width={30} />,
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
              className="flex items-center gap-1 font-semibold text-md rounded-xl px-4 py-2 hover:bg-accent"
            >
              {item.beforeIcon}
              {item.name}
            </Link>
          </li>
        )
      )}
    </ul>
  );
};

export default NavItems;
