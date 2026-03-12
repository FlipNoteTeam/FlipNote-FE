import type { GroupDetail } from "@/domain/group/types";
import { GROUP_CATEGORY_MAP } from "@/domain/group/types";
import { Card, CardContent } from "@/shared/components/card";

type GroupInfoCardProps = {
  group: GroupDetail;
};

export const GroupInfoCard = ({ group }: GroupInfoCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* 그룹 이미지 */}
        <div className="md:w-1/3">
          <img
            src={group.imageUrl || "https://picsum.photos/400/300"}
            alt={`${group.name} 그룹 이미지`}
            className="h-64 w-full rounded-lg object-cover md:h-full"
          />
        </div>

        {/* 그룹 정보 */}
        <CardContent className="flex-1 space-y-4 py-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {GROUP_CATEGORY_MAP[group.category]}
              </span>
              <span className="text-muted-foreground text-sm">
                최대 {group.maxMember}명
              </span>
              {group.applicationRequired && (
                <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  가입 승인 필요
                </span>
              )}
              {group.visibility ? (
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-400">
                  공개
                </span>
              ) : (
                <span className="rounded-full bg-gray-500/10 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                  비공개
                </span>
              )}
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {group.description}
          </p>
        </CardContent>
      </div>
    </Card>
  );
};
