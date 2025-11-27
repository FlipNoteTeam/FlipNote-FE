import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Label } from "@/shared/components/label";
import { Input } from "@/shared/components/input";
import { usePasswordResetRequest } from "../hooks/usePasswordResetRequest";

const PasswordResetRequestForm = () => {
  const { register, handleSubmit, errors, errorMessage, isSuccess, isPending } =
    usePasswordResetRequest();

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              이메일 전송 완료
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                <p className="text-sm">
                  비밀번호 재설정 링크가 이메일로 전송되었습니다.
                  <br />
                  이메일을 확인하여 비밀번호 재설정을 진행해주세요.
                </p>
              </div>
              <p className="text-sm text-gray-600 text-center">
                이메일이 도착하지 않았다면 스팸 메일함을 확인해주세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            비밀번호 재설정
          </CardTitle>
          <p className="text-sm text-gray-600 text-center mt-2">
            가입하신 이메일 주소를 입력하시면
            <br />
            비밀번호 재설정 링크를 보내드립니다.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                {...register("email", {
                  required: "이메일을 입력해주세요",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "올바른 이메일 형식이 아닙니다",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "전송 중..." : "재설정 링크 전송"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordResetRequestForm;
