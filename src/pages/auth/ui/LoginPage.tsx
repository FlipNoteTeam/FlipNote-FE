import { Card, CardContent, CardFooter } from "@/shared/components/card";
import { Input } from "@/shared/components/input";
import { PasswordInput } from "@/shared/components/password-input";
import { ErrorMessage } from "@/shared/components/error-message";
import { Button } from "@/shared/components/button";
import { Label } from "@/shared/components/label";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import BaseLayout from "@/shared/layouts/base-layout";
import { Sparkles } from "lucide-react";
import useAuthStore from "@/stores/useAuthStore";
import {
  loginSchema,
  type LoginFormData,
} from "@/pages/auth/model/loginSchema";
import TextSeperator from "@/shared/components/text-separator";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate({ from: "/auth/login" });
  const search = useSearch({ from: "/auth/login" });

  const login = useAuthStore((state) => state.login);
  const isLoggingIn = useAuthStore((state) => state.isLoggingIn);

  const handleLogin = async (data: LoginFormData) => {
    await login({ email: data.email, password: data.password });
    // redirect 파라미터가 있으면 해당 페이지로, 없으면 홈으로
    navigate({ to: search.redirect ?? "/" });
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
              <Input
                id="email"
                placeholder="이메일을 입력해주세요"
                {...register("email")}
              />
              <ErrorMessage>{errors.email?.message}</ErrorMessage>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <PasswordInput
                id="password"
                placeholder="비밀번호를 입력해주세요"
                {...register("password")}
              />
              <ErrorMessage>{errors.password?.message}</ErrorMessage>
            </div>
            {/* <Link to="/reset-password">비밀번호 찾기</Link> */}
          </CardContent>
          <CardFooter className="flex-col space-y-6 mt-4 ">
            <Button
              type="submit"
              variant="default"
              className="w-full"
              onClick={handleSubmit(handleLogin)}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "로그인 중..." : "로그인"}
            </Button>

            <TextSeperator>또는</TextSeperator>

            <div className="w-full space-y-2">
              <Button variant="outline" className="w-full">
                Google로 로그인
              </Button>
            </div>

            <ul className="w-full text-sm text-left">
              <li>
                <Link to="/auth/register" className="text-blue-600">
                  계정이 없으신가요?
                </Link>
              </li>
              <li>
                <Link to="/reset-password" className="text-blue-600">
                  비밀번호를 잊어버리셨나요?
                </Link>
              </li>
            </ul>
          </CardFooter>
        </Card>
      </div>
    </BaseLayout>
  );
};

export default LoginPage;
