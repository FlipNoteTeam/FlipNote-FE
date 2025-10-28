import { Button } from "@/shared/components/button";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import AlarmSheet from "@/features/gnb/components/alarm-sheet";
import useAuthStore from "@/stores/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/dropdown-menu";

const AuthenticatedNav = () => {
  const { user, unauthenticate } = useAuthStore();

  if (!user) return null;
  return (
    <ul className="flex items-center space-x-4">
      <li className="text-md">
        <Link to="/">대시보드</Link>
      </li>
      <li className="text-md">
        <Link to="/">내 스터디</Link>
      </li>
      <li className="text-md">
        <Link to="/">마이페이지</Link>
      </li>
      <li>
        <AlarmSheet>
          {({ unreadCount }) => (
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          )}
        </AlarmSheet>
      </li>
      <li>
        <DropdownMenu>
          <DropdownMenuTrigger>{user.name}</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/">내 정보</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={unauthenticate}>
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    </ul>
  );
};

export default AuthenticatedNav;
