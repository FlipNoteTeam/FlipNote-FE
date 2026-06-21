import AuthenticatedNav from "@/features/gnb/components/authenticated-nav";
import NavItems from "@/features/gnb/components/nav-items";
import UnauthenticatedNav from "@/features/gnb/components/unauthenticated-nav";
import MobileMenu from "@/features/gnb/components/mobile-menu";
import { Skeleton } from "@/shared/components/skeleton";
import useAuthStore from "@/stores/use-auth-store";
import { Link } from "@tanstack/react-router";

const GrobalNavigationBar = () => {
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-50  backdrop-blur-sm">
      <nav className="mx-auto px-4 sm:px-6 lg:px-8 border-b ">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">
              <Link to="/">
                <img
                  src="/flipnote_logo_long.png"
                  className="h-10"
                  alt="플립노트 로고"
                />
              </Link>
            </h1>
          </div>
          <NavItems className="hidden lg:flex" />
          <ul className="hidden lg:flex items-center space-x-4 text-pri">
            {isInitializing ? (
              <li className="flex gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-20 h-8 rounded-full" />
              </li>
            ) : user ? (
              <AuthenticatedNav />
            ) : (
              <UnauthenticatedNav />
            )}
          </ul>
          <div className="lg:hidden">
            <MobileMenu />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default GrobalNavigationBar;
