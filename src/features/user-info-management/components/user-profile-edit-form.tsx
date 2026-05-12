import { Card, CardContent, CardHeader } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import {
  useController,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from "react-hook-form";
import type { MyInfoResponse } from "@/shared/apis/user";
import type { UserInfoFormField } from "@/features/user-info-management/schemas/form.schema";
import { PhoneInput } from "@/shared/components/phone-input";
import { useState, useRef } from "react";
import { Camera, X } from "lucide-react";

type Props = {
  userInfo: MyInfoResponse;
  register: UseFormRegister<UserInfoFormField>;
  control: Control<UserInfoFormField>;
  errors: FieldErrors<UserInfoFormField>;
  onSubmit: () => void;
  onCancel: () => void;
  isPending?: boolean;
  onImageChange?: (file: File | null) => void;
};

const UserProfileEditForm = ({
  userInfo,
  register,
  control,
  onSubmit,
  onCancel,
  isPending = false,
  onImageChange,
}: Props) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { field: phoneField } = useController({
    name: "phone",
    control,
  });

  /**@TODO 이미지 업로드 컴포넌트 별도로 분리 */
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageChange?.(file);
    }
  };

  const handleImageRemove = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageChange?.(null);
  };

  const displayImage = previewImage || userInfo?.profileImageUrl;

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader className="px-4 py-0 mt-4">
          <h2 className="text-2xl font-bold">내 정보 수정</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-4">
              <Label className="text-gray-500">프로필 이미지</Label>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  {displayImage ? (
                    <>
                      <img
                        src={displayImage}
                        alt="프로필"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="이미지 삭제"
                      >
                        <X size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={handleImageClick}
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        aria-label="이미지 변경"
                      >
                        <Camera size={24} className="text-white" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                      aria-label="이미지 업로드"
                    >
                      <Camera size={32} className="text-gray-400" />
                      <span className="text-xs text-gray-400 mt-2">
                        이미지 추가
                      </span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  aria-label="프로필 이미지 파일 선택"
                />
              </div>

              <Label className="text-gray-500">이메일</Label>
              <p className="text-sm">{userInfo.email}</p>

              <Label className="text-gray-500">이름</Label>
              <p className="text-sm">{userInfo.name}</p>

              <Label className="text-gray-500">닉네임</Label>
              <Input
                id="nickname"
                className="text-sm"
                {...register("nickname", {
                  required: "닉네임을 입력해주세요",
                  minLength: {
                    value: 2,
                    message: "닉네임은 최소 2자 이상이어야 합니다",
                  },
                })}
              />
              {/* <p className="text-sm">{userInfo.nickname}</p> */}

              <Label className="text-gray-500">전화번호</Label>
              <PhoneInput {...phoneField}></PhoneInput>

              <Label className="text-gray-500">가입일</Label>
              <p className="text-sm">
                {new Date(userInfo.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? "저장 중..." : "저장"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfileEditForm;
