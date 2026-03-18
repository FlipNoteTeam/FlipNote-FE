import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/card";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { groupApi } from "@/shared/apis/group";
import { mockWrongAnswerNotes } from "@/shared/mocks/wrong-answer-notes";
import { BookOpen, Users, Calendar, AlertCircle, SearchX } from "lucide-react";
import { ThumbnailCard } from "@/shared/components/thumbnail-card";
import { DashboardSkeleton } from "@/shared/components/skeletons";
import { EmptyState } from "@/shared/components/empty-state";
import { Button } from "@/shared/components/button";
import ErrorDisplay from "@/shared/components/error-display";

const Dashboard = () => {
  // 내 그룹 조회
  const {
    data: myGroupsData,
    isLoading: isLoadingGroups,
    error: groupsError,
  } = useQuery({
    queryKey: ["myGroups"],
    queryFn: async () => {
      const response = await groupApi.getMyGroups({ size: 6 });
      return response.data.data;
    },
  });

  // 내가 만든 그룹 조회
  const {
    data: ownedGroupsData,
    isLoading: isLoadingOwnedGroups,
    error: ownedGroupsError,
  } = useQuery({
    queryKey: ["myOwnedGroups"],
    queryFn: async () => {
      const response = await groupApi.getMyOwnedGroups({ size: 6 });
      return response.data.data;
    },
  });

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600">나의 학습 현황을 한눈에 확인하세요</p>
      </div>

      {/* 내가 만든 그룹 섹션 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6" />
            내가 만든 그룹
          </h2>
          <Link to="/groups" className="text-sm text-primary hover:underline">
            전체 보기
          </Link>
        </div>
        {ownedGroupsError ? (
          <ErrorDisplay />
        ) : (
          <>
            {!ownedGroupsError && isLoadingOwnedGroups && <DashboardSkeleton />}
            {!isLoadingOwnedGroups &&
            ownedGroupsData?.content &&
            ownedGroupsData?.content.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedGroupsData.content.map((group) => (
                  <Link
                    to="/groups/$groupId"
                    params={{ groupId: group.groupId.toString() }}
                    key={group.groupId}
                  >
                    <ThumbnailCard
                      imageUrl={group.imageUrl}
                      title={group.name}
                      subtitle={group.description}
                      category={group.category}
                      className="p-4"
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-8">
                <EmptyState
                  icon={<SearchX className="w-7 h-7" />}
                  title="생성한 그룹이 없어요"
                  description="그룹을 만들어봐요!"
                  action={
                    <Button asChild variant={"outline"} size="sm">
                      <Link to="/groups/create">그룹 만들기</Link>
                    </Button>
                  }
                />
              </Card>
            )}
          </>
        )}
      </section>

      {/* 내 그룹 섹션 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6" />내 그룹
          </h2>
          <Link to="/groups" className="text-sm text-primary hover:underline">
            전체 보기
          </Link>
        </div>

        {isLoadingGroups && <DashboardSkeleton />}
        {!isLoadingGroups &&
        myGroupsData?.content &&
        myGroupsData.content.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroupsData.content.map((group) => (
              <Link
                to="/groups/$groupId"
                params={{ groupId: group.groupId.toString() }}
                key={group.groupId}
              >
                <ThumbnailCard
                  imageUrl={group.imageUrl}
                  title={group.name}
                  subtitle={group.description}
                  category={group.category}
                  className="p-4"
                />
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-8">
            <EmptyState
              icon={<SearchX className="w-7 h-7" />}
              title="가입한 그룹이 없어요"
              description="다양한 그룹이 기다리고 있어요!"
              action={
                <Button asChild variant={"outline"} size="sm">
                  <Link to="/groups">그룹 둘러보기</Link>
                </Button>
              }
            />
          </Card>
        )}
        {groupsError && <ErrorDisplay />}
      </section>

      {/* 오답노트 섹션 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            오답노트
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockWrongAnswerNotes.map((note) => (
            <Card
              key={note.id}
              className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{note.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {note.description}
                    </CardDescription>
                  </div>
                  <BookOpen className="w-5 h-5 text-primary shrink-0 ml-2" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {note.groupName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{note.groupName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                      전체:{" "}
                      <span className="font-semibold text-gray-900">
                        {note.cardCount}
                      </span>
                      개
                    </span>
                    <span className="text-red-600">
                      오답:{" "}
                      <span className="font-semibold">{note.wrongCount}</span>개
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>마지막 학습: {note.lastStudiedAt}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
