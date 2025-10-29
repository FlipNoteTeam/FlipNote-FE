import { Card, CardContent, CardHeader } from "@/shared/components/card";
import { Label } from "@/shared/components/label";
import type { UserInfoResponse } from "@/shared/apis/user";

type Props = {
  userInfo: UserInfoResponse;
};

const OtherUserProfile = ({ userInfo }: Props) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">프로필</h2>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label>닉네임</Label>
            <p className="text-lg mt-1">{userInfo.nickname}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OtherUserProfile;
