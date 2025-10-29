import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, type UserUpdateRequest, type MyInfoResponse } from "@/shared/apis/user";

export const useUserInfoEdit = () => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UserUpdateRequest>({
    defaultValues: {
      nickname: "",
      phone: "",
      smsAgree: false,
      profileImageUrl: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: userApi.updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInfo"] });
      setIsEditing(false);
    },
  });

  const handleEditStart = (userInfo: MyInfoResponse) => {
    reset({
      nickname: userInfo.nickname,
      phone: userInfo.phone || "",
      smsAgree: userInfo.smsAgree,
      profileImageUrl: userInfo.profileImageUrl || "",
    });
    setIsEditing(true);
  };

  const onSubmit = (data: UserUpdateRequest) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return {
    isEditing,
    register,
    handleSubmit: handleSubmit(onSubmit),
    control,
    errors,
    isPending: updateMutation.isPending,
    handleEditStart,
    handleCancel,
  };
};
