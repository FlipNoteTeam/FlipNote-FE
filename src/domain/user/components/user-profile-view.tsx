import { Card, CardContent, CardHeader } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Label } from "@/shared/components/label";
import type { MyInfoResponse } from "@/shared/apis/user";
import SocialAccountSection from "@/features/social-link/components/social-account-section";

type Props = {
  userInfo: MyInfoResponse;
  onEditClick: () => void;
};

const UserProfileView = ({ userInfo, onEditClick }: Props) => {
  return (
    <div className="container mx-auto ">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-4 py-0 mt-4">
          <h2 className="text-2xl font-bold">내 정보</h2>
          <Button variant="link" className="p-2" onClick={onEditClick}>
            수정
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-4">
              <Label className="text-gray-500">프로필 이미지</Label>
              {userInfo.profileImageUrl ? (
                <img
                  src={userInfo.profileImageUrl}
                  alt="프로필"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm text-gray-400">
                  등록된 이미지가 없습니다.
                </span>
              )}

              <Label className="text-gray-500">이메일</Label>
              <p className="text-sm">{userInfo.email}</p>

              <Label className="text-gray-500">이름</Label>
              <p className="text-sm">{userInfo.name}</p>

              <Label className="text-gray-500">닉네임</Label>
              <p className="text-sm">{userInfo.nickname}</p>

              <Label className="text-gray-500">전화번호</Label>
              <p className="text-sm">{userInfo.phone || "미등록"}</p>

              <Label className="text-gray-500">가입일</Label>
              <p className="text-sm">
                {new Date(userInfo.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <SocialAccountSection />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfileView;
