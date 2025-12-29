import AuthenticatedNav from "@/features/gnb/components/authenticated-nav";
import NavItems from "@/features/gnb/components/nav-items";
import UnauthenticatedNav from "@/features/gnb/components/unauthenticated-nav";
import { Skeleton } from "@/shared/components/skeleton";
import useAuthStore from "@/stores/useAuthStore";
import { Link } from "@tanstack/react-router";

const GNB = () => {
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
          <NavItems />
          <ul className="flex items-center space-x-4 text-pri">
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
        </div>
      </nav>
    </header>
  );
};

export default GNB;
