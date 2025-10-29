import { Card, CardContent, CardHeader } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { Checkbox } from "@/shared/components/checkbox";
import { ErrorMessage } from "@/shared/components/form";
import { useController, type Control, type UseFormRegister, type FieldErrors } from "react-hook-form";
import type { UserUpdateRequest } from "@/shared/apis/user";

type Props = {
  register: UseFormRegister<UserUpdateRequest>;
  control: Control<UserUpdateRequest>;
  errors: FieldErrors<UserUpdateRequest>;
  onSubmit: () => void;
  onCancel: () => void;
  isPending?: boolean;
};

const UserProfileEditForm = ({
  register,
  control,
  errors,
  onSubmit,
  onCancel,
  isPending = false,
}: Props) => {
  const { field: smsAgreeField } = useController({
    name: "smsAgree",
    control,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">내 정보 수정</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                {...register("nickname", {
                  required: "닉네임을 입력해주세요",
                  minLength: {
                    value: 2,
                    message: "닉네임은 최소 2자 이상이어야 합니다",
                  },
                })}
              />
              {errors.nickname && (
                <ErrorMessage>{errors.nickname.message}</ErrorMessage>
              )}
            </div>
            <div>
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                {...register("phone", {
                  pattern: {
                    value: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
                    message: "올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)",
                  },
                })}
                placeholder="010-1234-5678"
              />
              {errors.phone && (
                <ErrorMessage>{errors.phone.message}</ErrorMessage>
              )}
            </div>
            <div>
              <Label htmlFor="profileImageUrl">프로필 이미지 URL</Label>
              <Input
                id="profileImageUrl"
                {...register("profileImageUrl", {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: "올바른 URL 형식이 아닙니다 (예: https://...)",
                  },
                })}
                placeholder="https://..."
              />
              {errors.profileImageUrl && (
                <ErrorMessage>{errors.profileImageUrl.message}</ErrorMessage>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="smsAgree"
                checked={smsAgreeField.value}
                onCheckedChange={smsAgreeField.onChange}
              />
              <Label htmlFor="smsAgree">SMS 수신 동의</Label>
            </div>
            <div className="flex gap-2">
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
