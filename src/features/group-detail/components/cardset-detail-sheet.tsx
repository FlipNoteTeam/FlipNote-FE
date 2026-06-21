import { Suspense, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/sheet";
import { PageSkeleton } from "@/shared/components/skeletons/page-skeleton";
import CardsetDetailContent from "@/features/cardset/components/cardset-detail-content";

type Props = {
  groupId: number;
  cardsetId: number;
};

const CardsetDetailSheet = ({ groupId, cardsetId }: Props) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => setIsOpen(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose();
  };

  const handleAnimationEnd = () => {
    if (!isOpen) {
      navigate({ to: "/groups/$groupId", params: { groupId: String(groupId) }, replace: true });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-hidden p-0 flex flex-col"
        onAnimationEnd={handleAnimationEnd}
      >
        <SheetHeader className="px-6 pt-6 pb-2 shrink-0">
          <SheetTitle className="text-lg font-bold">카드셋 상세</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto flex-1">
          <Suspense fallback={<PageSkeleton />}>
            <CardsetDetailContent groupId={groupId} cardsetId={cardsetId} />
          </Suspense>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CardsetDetailSheet;
