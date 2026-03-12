import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/shared/apis/user";
import UserProfileView from "@/domain/user/components/user-profile-view";
import UserProfileEditForm from "@/features/user-info-management/components/user-profile-edit-form";
import { useUserInfoEdit } from "@/features/user-info-management/hooks/use-user-info-edit";
import { ProfileCardSkeleton } from "@/shared/components/skeletons";
import ErrorDisplay from "@/shared/components/error-display";

const MyUserProfilePage = () => {
  // 본인 정보 조회
  const { data: myInfo, isLoading, isError, refetch } = useQuery({
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
    handleImageChange,
  } = useUserInfoEdit();

  if (isLoading) {
    return <ProfileCardSkeleton />;
  }

  if (isError || !myInfo) {
    return <ErrorDisplay onRetry={() => refetch()} />;
  }

  if (isEditing) {
    return (
      <UserProfileEditForm
        userInfo={myInfo}
        register={register}
        control={control}
        errors={errors}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isPending={isPending}
        onImageChange={handleImageChange}
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
