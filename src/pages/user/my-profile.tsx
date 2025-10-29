import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/shared/apis/user";
import { Card, CardContent } from "@/shared/components/card";
import UserProfileView from "@/domain/user/components/user-profile-view";
import UserProfileEditForm from "@/features/user-info-management/components/user-profile-edit-form";
import { useUserInfoEdit } from "@/features/user-info-management/hooks/useUserInfoEdit";

const MyUserProfilePage = () => {
  // 본인 정보 조회
  const { data: myInfo, isLoading } = useQuery({
    queryKey: ["myInfo"],
    queryFn: async () => {
      const response = await userApi.getMyInfo();
      return response.data.data;
    },
  });

  // 수정 기능
  const {
    isEditing,
    register,
    control,
    errors,
    isPending,
    handleEditStart,
    handleSubmit,
    handleCancel,
  } = useUserInfoEdit();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center">로딩 중...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!myInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center">사용자 정보를 찾을 수 없습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing) {
    return (
      <UserProfileEditForm
        register={register}
        control={control}
        errors={errors}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isPending={isPending}
      />
    );
  }

  return (
    <UserProfileView
      userInfo={myInfo}
      onEditClick={() => handleEditStart(myInfo)}
    />
  );
};

export default MyUserProfilePage;
