import { Suspense } from "react";
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

  const handleClose = () => {
    navigate({ to: "/groups/$groupId", params: { groupId: String(groupId) } });
  };

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <SheetContent
        side="bottom"
        className="h-[85vh] overflow-y-auto rounded-t-2xl p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="text-lg font-bold">카드셋 상세</SheetTitle>
        </SheetHeader>
        <Suspense fallback={<PageSkeleton />}>
          <CardsetDetailContent groupId={groupId} cardsetId={cardsetId} />
        </Suspense>
      </SheetContent>
    </Sheet>
  );
};

export default CardsetDetailSheet;
