import AuthenticatedNav from "@/features/gnb/components/authenticated-nav";
import UnauthenticatedNav from "@/features/gnb/components/unauthenticated-nav";
import useAuthStore from "@/stores/useAuthStore";

const GNB = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="w-full bg-white shadow-sm border-b">
      <nav className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">FlipNote</h1>
          </div>
          <ul className="flex items-center space-x-4">
            {user ? <AuthenticatedNav /> : <UnauthenticatedNav />}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default GNB;
