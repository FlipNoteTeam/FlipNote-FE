import { Card, CardContent, CardFooter } from "@/shared/components/card";
import { Input } from "@/shared/components/input";
import { Button } from "@/shared/components/button";
import { Label } from "@/shared/components/label";
import { authApi, type UserLoginRequest } from "@/shared/apis";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import useAuthStore from "@/stores/useAuthStore";
import BaseLayout from "@/shared/layouts/base-layout";
import { Sparkles } from "lucide-react";

type FieldState = UserLoginRequest;

const Login = () => {
  const navigate = useNavigate({ from: "/auth/register" });
  const search = useSearch({ from: "/auth/login" });
  const redirectUrl = search.redirect;

  const { getValues, register } = useForm<FieldState>({});
  const updateAccessToken = useAuthStore((state) => state.updateAccessToken);
  const { mutate: login } = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (res) => {
      await updateAccessToken(res.data.data.accessToken);
      // redirect 파라미터가 있으면 해당 페이지로, 없으면 홈으로
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        navigate({ to: "/" });
      }
    },
  });

  const convertToRequestBody = (fieldStates: FieldState): UserLoginRequest => {
    return {
      email: fieldStates.email,
      password: fieldStates.password,
    };
  };

  const handleSubmit = () => {
    const body = convertToRequestBody(getValues());
    login(body);
  };

  return (
    <BaseLayout>
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary">FlipNote</h1>
          <p className="text-sm text-muted-foreground mt-1">
            FlipNote에 오신 걸 환영합니다!
          </p>
        </div>
      </div>
      <div className="text-center space-y-3">
        <Card className="mt-4 py-16 px-8 max-w-md mx-auto">
          <CardContent className="w-full space-y-4 ">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" {...register("email")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input type="password" id="password" {...register("password")} />
            </div>
            {/* <Link to="/reset-password">비밀번호 찾기</Link> */}
          </CardContent>
          <CardFooter className="flex-col space-y-6 mt-4 ">
            <Button
              type="submit"
              variant="default"
              className="w-full"
              onClick={handleSubmit}
            >
              로그인
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">
                  또는
                </span>
              </div>
            </div>

            <div className="w-full space-y-2">
              <Button variant="outline" className="w-full">
                Google로 로그인
              </Button>
              <Button variant="outline" className="w-full">
                Kakao로 로그인
              </Button>
              <Button variant="outline" className="w-full">
                Github로 로그인
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </BaseLayout>
  );
};

export default Login;
