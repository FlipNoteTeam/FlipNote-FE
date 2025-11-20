import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/card";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { groupApi } from "@/shared/apis/group";
import { mockWrongAnswerNotes } from "@/shared/mocks/wrong-answer-notes";
import { BookOpen, Users, Calendar, AlertCircle } from "lucide-react";
import { GROUP_CATEGORY_MAP } from "@/domain/group/types";

const Dashboard = () => {
  // 내 그룹 조회
  const { data: myGroupsData, isLoading: isLoadingGroups, error: groupsError } = useQuery({
    queryKey: ["myGroups"],
    queryFn: async () => {
      const response = await groupApi.getMyGroups({ size: 6 });
      return response.data.data;
    },
  });

  if (isLoadingGroups) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (groupsError) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-red-500">데이터를 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* 헤더 */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600">나의 학습 현황을 한눈에 확인하세요</p>
        </div>

        {/* 내 그룹 섹션 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6" />
              내 그룹
            </h2>
            <Link
              to="/groups"
              className="text-sm text-primary hover:underline"
            >
              전체 보기
            </Link>
          </div>

          {myGroupsData?.content && myGroupsData.content.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGroupsData.content.map((group) => (
                <Link
                  to="/groups/$groupId"
                  params={{ groupId: group.groupId.toString() }}
                  key={group.groupId}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full">
                    <div className="w-full h-40 bg-gray-100">
                      {group.imageUrl ? (
                        <img
                          src={group.imageUrl}
                          alt={`${group.name}의 썸네일`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                        {group.name}
                      </h3>
                      <CardDescription className="line-clamp-2 text-sm mb-3">
                        {group.description}
                      </CardDescription>
                      <div className="flex justify-between items-center">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {GROUP_CATEGORY_MAP[group.category]}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-8">
              <div className="text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>가입한 그룹이 없습니다.</p>
                <Link
                  to="/groups"
                  className="text-primary hover:underline text-sm mt-2 inline-block"
                >
                  그룹 둘러보기
                </Link>
              </div>
            </Card>
          )}
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
                    <BookOpen className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
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
                        전체: <span className="font-semibold text-gray-900">{note.cardCount}</span>개
                      </span>
                      <span className="text-red-600">
                        오답: <span className="font-semibold">{note.wrongCount}</span>개
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
