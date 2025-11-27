import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Label } from "@/shared/components/label";
import { Input } from "@/shared/components/input";
import { PasswordInput } from "@/shared/components/password-input";
import { usePasswordReset } from "../hooks/usePasswordReset";

const PasswordResetForm = () => {
  const { register, handleSubmit, errors, password, errorMessage, isPending } =
    usePasswordReset();

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            비밀번호 재설정
          </CardTitle>
          <p className="text-sm text-gray-600 text-center mt-2">
            이메일로 받은 인증 토큰과 새 비밀번호를 입력하세요
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">인증 토큰</Label>
              <Input
                id="token"
                placeholder="이메일로 받은 토큰을 입력하세요"
                {...register("token", {
                  required: "인증 토큰을 입력해주세요",
                })}
              />
              {errors.token && (
                <p className="text-sm text-red-500">{errors.token.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">새 비밀번호</Label>
              <PasswordInput
                id="password"
                placeholder="새 비밀번호를 입력하세요"
                {...register("password", {
                  required: "비밀번호를 입력해주세요",
                  minLength: {
                    value: 8,
                    message: "비밀번호는 최소 8자 이상이어야 합니다",
                  },
                  pattern: {
                    value: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다",
                  },
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
              <PasswordInput
                id="passwordConfirm"
                placeholder="비밀번호를 다시 입력하세요"
                {...register("passwordConfirm", {
                  required: "비밀번호 확인을 입력해주세요",
                  validate: (value) =>
                    value === password || "비밀번호가 일치하지 않습니다",
                })}
              />
              {errors.passwordConfirm && (
                <p className="text-sm text-red-500">
                  {errors.passwordConfirm.message}
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "재설정 중..." : "비밀번호 재설정"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordResetForm;
