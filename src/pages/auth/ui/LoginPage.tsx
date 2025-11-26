import { Card, CardContent, CardFooter } from "@/shared/components/card";
import { Input } from "@/shared/components/input";
import { Button } from "@/shared/components/button";
import { Label } from "@/shared/components/label";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import BaseLayout from "@/shared/layouts/base-layout";
import { Sparkles } from "lucide-react";
import { useLogin } from "@/pages/auth/model/useLogin";
import {
  loginSchema,
  type LoginFormData,
} from "@/pages/auth/model/loginSchema";

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

  const { login, isPending } = useLogin(() => {
    // redirect 파라미터가 있으면 해당 페이지로, 없으면 홈으로
    if (search.redirect) {
      window.location.href = search.redirect;
    } else {
      navigate({ to: "/" });
    }
  });

  const handleLogin = (data: LoginFormData) => {
    login({ email: data.email, password: data.password });
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
              {errors.email && (
                <span className="text-sm text-red-500">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input type="password" id="password" {...register("password")} />
              {errors.password && (
                <span className="text-sm text-red-500">
                  {errors.password.message}
                </span>
              )}
            </div>
            {/* <Link to="/reset-password">비밀번호 찾기</Link> */}
          </CardContent>
          <CardFooter className="flex-col space-y-6 mt-4 ">
            <Button
              type="submit"
              variant="default"
              className="w-full"
              onClick={handleSubmit(handleLogin)}
              disabled={isPending}
            >
              {isPending ? "로그인 중..." : "로그인"}
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

            <span className="text-sm">
              계정이 없으신가요? <Link to="/auth/register">여기</Link>를 눌러
              회원가입을 해보세요
            </span>
          </CardFooter>
        </Card>
      </div>
    </BaseLayout>
  );
};

export default LoginPage;
