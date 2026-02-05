import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/shared/apis/user";
import { Card, CardContent } from "@/shared/components/card";
import OtherUserProfile from "@/domain/user/components/other-user-profile";
import { ProfileCardSkeleton } from "@/shared/components/skeletons";
import { useMeta } from "@/shared/hooks/use-meta";

type Props = {
  userId: string;
};

const OtherUserProfilePage = ({ userId }: Props) => {
  // 타인 정보 조회
  const { data: userInfo, isLoading } = useQuery({
    queryKey: ["userInfo", userId],
    queryFn: async () => {
      const response = await userApi.getUserInfo(Number(userId));
      return response.data.data;
    },
  });

  useMeta({
    title: userInfo ? `${userInfo.nickname}의 프로필 | FlipNote` : undefined,
    description: userInfo
      ? `${userInfo.nickname}의 프로필을 확인하세요`
      : undefined,
  });

  if (isLoading) {
    return <ProfileCardSkeleton />;
  }

  if (!userInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center">사용자를 찾을 수 없습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <OtherUserProfile userInfo={userInfo} />;
};

export default OtherUserProfilePage;
