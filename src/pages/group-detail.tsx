import { Plus } from "lucide-react";
import type { GroupDetailResponse, GroupMemberInfo } from "@/shared/apis";
import type { CardSetSummaryResponse } from "@/shared/apis/card-set";
import { Button } from "@/shared/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/carousel";
import BaseLayout from "@/shared/layouts/base-layout";
import { GroupInfoCard } from "@/domain/group/components/GroupInfoCard";
import { MemberCard } from "@/domain/members/components/MemberCard";
import { CardsetCard } from "@/domain/cardsets/components/CardsetCard";

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
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        {/* 그룹 정보 섹션 */}
        <GroupInfoCard group={groupData} />

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
                <CarouselItem
                  key={member.id}
                  className="md:basis-1/3 lg:basis-1/5"
                >
                  <MemberCard member={member} />
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
              <CardsetCard key={cardSet.cardSetId} cardset={cardSet} />
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
