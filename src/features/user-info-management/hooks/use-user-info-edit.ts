import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  userApi,
  type MyInfoResponse,
} from "@/shared/apis/user";
import { uploadImage } from "@/shared/lib/upload-image";
import {
  userInfoFormSchema,
  type UserInfoFormField,
} from "@/features/user-info-management/schemas/form.schema";

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
  } = useForm<UserInfoFormField>({
    resolver: zodResolver(userInfoFormSchema),
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

  const onSubmit = async (data: UserInfoFormField) => {
    try {
      let imageRefId: number | undefined;

      if (selectedImageFile) {
        imageRefId = await uploadImage({
          file: selectedImageFile,
          type: "USER",
        });
      }

      console.log("IMAGEREFID", imageRefId);

      updateMutation.mutate({
        nickname: data.nickname,
        phone: data.phone,
        smsAgree: data.smsAgree,
        profileImageUrl: data.profileImageUrl,
        imageRefId,
      });
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      updateMutation.mutate({
        nickname: data.nickname,
        phone: data.phone,
        smsAgree: data.smsAgree,
        profileImageUrl: data.profileImageUrl,
      });
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
