import { Plus } from "lucide-react";
import type { GroupDetailResponse, GroupMemberInfo } from "@/shared/apis";
import type { CardSetSummaryResponse } from "@/shared/apis/card-set";
import { Button } from "@/shared/components/button";
import { Card, CardContent } from "@/shared/components/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/carousel";
import BaseLayout from "@/shared/layouts/base-layout";
import { GROUP_CATEGORY_MAP } from "@/domain/group";

type Props = { id: string };

const GroupDetailPage = ({ id }: Props) => {
  // TODO: id를 사용해 실제 API 호출로 데이터 가져오기
  console.log("Group ID:", id);

  // Mock data - 나중에 실제 API 호출로 교체
  const groupData = mockGroupData;
  const members = mockMembers;
  const cardSets = mockCardSets;
  const hasManagePermission = true; // 실제로는 사용자 권한 체크

  return (
    <BaseLayout>
      {/* 그룹 정보 섹션 */}
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-6 md:flex-row">
            {/* 그룹 이미지 */}
            <div className="md:w-1/3">
              <img
                src={groupData.imageUrl || "https://picsum.photos/400/300"}
                alt={`${groupData.name} 그룹 이미지`}
                className="h-64 w-full rounded-lg object-cover md:h-full"
              />
            </div>

            {/* 그룹 정보 */}
            <CardContent className="flex-1 space-y-4 py-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{groupData.name}</h1>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {GROUP_CATEGORY_MAP[groupData.category]}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    최대 {groupData.maxMember}명
                  </span>
                  {groupData.applicationRequired && (
                    <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                      가입 승인 필요
                    </span>
                  )}
                  {groupData.publicVisible ? (
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
                {groupData.description}
              </p>
            </CardContent>
          </div>
        </Card>

        {/* 멤버 섹션 */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">멤버</h2>
            {hasManagePermission && (
              <Button size="sm" variant="outline">
                <Plus className="size-4" />
                멤버 초대
              </Button>
            )}
          </div>
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent>
              {members.map((member) => (
                <CarouselItem key={member.id} className="md:basis-1/3 lg:basis-1/5">
                  <Card>
                    <CardContent className="flex flex-col items-center gap-3 p-4">
                      <div className="relative">
                        <img
                          src={
                            member.profile ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`
                          }
                          alt={member.name}
                          className="size-16 rounded-full object-cover"
                        />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {getRoleLabel(member.role)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>

        {/* 카드셋 목록 섹션 */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">카드셋</h2>
            {hasManagePermission && (
              <Button size="sm" variant="outline">
                <Plus className="size-4" />
                카드셋 생성
              </Button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cardSets.map((cardSet) => (
              <Card
                key={cardSet.cardSetId}
                className="cursor-pointer transition-all hover:shadow-lg"
              >
                <CardContent className="p-4">
                  {cardSet.imageUrl && (
                    <img
                      src={cardSet.imageUrl}
                      alt={cardSet.name}
                      className="mb-3 h-40 w-full rounded-lg object-cover"
                    />
                  )}
                  <h3 className="mb-2 text-lg font-semibold">{cardSet.name}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {cardSet.category}
                    </span>
                    {cardSet.hashtag && (
                      <span className="text-muted-foreground text-xs">
                        #{cardSet.hashtag}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* 더보기 버튼 - 커서 기반 페이지네이션 */}
          <div className="mt-6 text-center">
            <Button variant="outline">더 보기</Button>
          </div>
        </section>
      </div>
    </BaseLayout>
  );
};

// 권한 레이블 변환 헬퍼
const getRoleLabel = (
  role: "OWNER" | "HEAD_MANAGER" | "MANAGER" | "STAFF" | "MEMBER"
): string => {
  const roleMap = {
    OWNER: "소유자",
    HEAD_MANAGER: "총괄 관리자",
    MANAGER: "관리자",
    STAFF: "스태프",
    MEMBER: "멤버",
  };
  return roleMap[role];
};

// Mock 데이터
const mockGroupData: GroupDetailResponse = {
  name: "React Study Group",
  category: "IT",
  description:
    "A group for learning and discussing React, Next.js, and modern web development.",
  applicationRequired: true,
  publicVisible: true,
  maxMember: 20,
  imageUrl: "https://picsum.photos/400/300?random=1",
  createdAt: "2024-03-10T10:00:00Z",
  modifiedAt: "2024-03-10T10:00:00Z",
};

const mockMembers: GroupMemberInfo[] = [
  { id: 1, role: "OWNER", name: "김철수", profile: "" },
  { id: 2, role: "MANAGER", name: "이영희", profile: "" },
  { id: 3, role: "MEMBER", name: "박민수", profile: "" },
  { id: 4, role: "MEMBER", name: "정수진", profile: "" },
  { id: 5, role: "STAFF", name: "최동욱", profile: "" },
];

const mockCardSets: CardSetSummaryResponse[] = [
  {
    cardSetId: 1,
    groupId: 1,
    name: "React Basics",
    category: "IT",
    hashtag: "react",
    imageUrl: "https://picsum.photos/300/200?random=2",
  },
  {
    cardSetId: 2,
    groupId: 1,
    name: "JavaScript ES6+",
    category: "IT",
    hashtag: "javascript",
    imageUrl: "https://picsum.photos/300/200?random=3",
  },
  {
    cardSetId: 3,
    groupId: 1,
    name: "TypeScript Fundamentals",
    category: "IT",
    hashtag: "typescript",
    imageUrl: "https://picsum.photos/300/200?random=4",
  },
];

export default GroupDetailPage;
