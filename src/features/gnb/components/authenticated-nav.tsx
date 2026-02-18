import { Button } from "@/shared/components/button";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import AlarmSheet from "@/features/gnb/components/alarm-sheet";
import useAuthStore from "@/stores/use-auth-store";
import { useLogout } from "@/features/auth/hooks/use-logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/dropdown-menu";

const AuthenticatedNav = () => {
  const user = useAuthStore((state) => state.user);
  const { mutate: logout } = useLogout();

  if (!user) return null;
  return (
    <ul className="flex items-center space-x-2">
      <li>
        <AlarmSheet>
          {({ unreadCount }) => (
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" strokeWidth={3} />
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
          <DropdownMenuTrigger className="font-semibold text-md">
            {/* <img
              src={user.profileImageUrl}
              className="w-4 h-4 object-fill rounded-full hover:bg-gray-100"
            /> */}
            {user.name}님
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  to="/user/$userId"
                  params={{ userId: user.userId.toString() }}
                >
                  내 정보
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => logout()}>
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
