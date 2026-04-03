import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/shared/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/sheet";
import NavItems from "@/features/gnb/components/nav-items";
import AuthenticatedNav from "@/features/gnb/components/authenticated-nav";
import UnauthenticatedNav from "@/features/gnb/components/unauthenticated-nav";
import useAuthStore from "@/stores/use-auth-store";
import { Skeleton } from "@/shared/components/skeleton";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const user = useAuthStore((state) => state.user);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="메뉴 열기"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <SheetContent side="right" className="w-64">
        <SheetHeader>
          <SheetTitle>메뉴</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4">
          <NavItems />
          <div className="border-t pt-4 md:p-4">
            {isInitializing ? (
              <div className="flex gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-20 h-8 rounded-full" />
              </div>
            ) : user ? (
              <AuthenticatedNav />
            ) : (
              <UnauthenticatedNav />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
