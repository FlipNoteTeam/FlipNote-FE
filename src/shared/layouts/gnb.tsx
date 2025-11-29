import AuthenticatedNav from "@/features/gnb/components/authenticated-nav";
import NavItems from "@/features/gnb/components/nav-items";
import UnauthenticatedNav from "@/features/gnb/components/unauthenticated-nav";
import useAuthStore from "@/stores/useAuthStore";
import { Link } from "@tanstack/react-router";

const GNB = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-50  backdrop-blur-sm">
      <nav className="mx-auto px-4 sm:px-6 lg:px-8">
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
            {user ? <AuthenticatedNav /> : <UnauthenticatedNav />}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default GNB;
