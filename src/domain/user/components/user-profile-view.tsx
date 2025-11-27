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
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-2xl font-bold">내 정보</h2>
          <Button onClick={onEditClick}>수정</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userInfo.profileImageUrl && (
              <div className="flex justify-center">
                <img
                  src={userInfo.profileImageUrl}
                  alt="프로필"
                  className="w-32 h-32 rounded-full object-cover"
                />
              </div>
            )}
            <div>
              <Label>이메일</Label>
              <p className="text-lg mt-1">{userInfo.email}</p>
            </div>
            <div>
              <Label>이름</Label>
              <p className="text-lg mt-1">{userInfo.name}</p>
            </div>
            <div>
              <Label>닉네임</Label>
              <p className="text-lg mt-1">{userInfo.nickname}</p>
            </div>
            <div>
              <Label>전화번호</Label>
              <p className="text-lg mt-1">{userInfo.phone || "미등록"}</p>
            </div>
            <div>
              <Label>SMS 수신 동의</Label>
              <p className="text-lg mt-1">
                {userInfo.smsAgree ? "동의" : "미동의"}
              </p>
            </div>
            <div>
              <Label>가입일</Label>
              <p className="text-lg mt-1">
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
