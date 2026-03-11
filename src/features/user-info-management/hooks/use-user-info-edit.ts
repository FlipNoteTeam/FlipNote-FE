import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  userApi,
  type UserUpdateRequest,
  type MyInfoResponse,
} from "@/shared/apis/user";
import { uploadImage } from "@/shared/lib/upload-image";

export const useUserInfoEdit = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
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

  const onSubmit = async (data: UserUpdateRequest) => {
    try {
      let imageRefId: number | undefined;

      // 이미지 파일이 선택되었으면 S3에 업로드
      if (selectedImageFile) {
        imageRefId = await uploadImage({
          file: selectedImageFile,
          type: "USER",
        });
      }

      console.log("IMAGEREFID", imageRefId);

      // 이미지 업로드 후 받은 imageRefId와 함께 사용자 정보 업데이트
      updateMutation.mutate({
        ...data,
        imageRefId,
      });
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      // 이미지 업로드 실패해도 사용자 정보는 업데이트
      updateMutation.mutate(data);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedImageFile(null);
  };

  const handleImageChange = (file: File | null) => {
    setSelectedImageFile(file);
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
    handleImageChange,
  };
};
