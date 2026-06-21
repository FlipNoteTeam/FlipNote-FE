import { Suspense } from "react";
import { useGroupDetail } from "@/domain/group/hooks/use-group-detail";
import BaseLayout from "@/shared/layouts/base-layout";
import { Link } from "@tanstack/react-router";
import { Users, ChevronRight } from "lucide-react";
import CardsetDetailContent from "@/features/cardset/components/cardset-detail-content";
import { PageSkeleton } from "@/shared/components/skeletons/page-skeleton";

type Props = {
  groupId: number;
  cardsetId: number;
};

const CardsetDetail = ({ groupId, cardsetId }: Props) => {
  const { data: group } = useGroupDetail(groupId);

  return (
    <BaseLayout>
      {/* 소속 그룹 배너 - full width */}
      <Link
        to="/groups/$groupId"
        params={{ groupId: String(groupId) }}
        className="-mx-4 -mt-6 sm:-mx-6 lg:-mx-16 lg:-mt-16 mb-8 block bg-primary/5 border-b hover:bg-primary/10 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/15">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">소속 그룹</p>
              <p className="font-bold text-base">{group?.name ?? "그룹 보기"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-primary font-medium">
            <span>그룹으로 이동</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </Link>

      <Suspense fallback={<PageSkeleton />}>
        <CardsetDetailContent groupId={groupId} cardsetId={cardsetId} />
      </Suspense>
    </BaseLayout>
  );
};

export default CardsetDetail;
