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
import { useLogin } from "@/features/auth/hooks/useLogin";
import {
  loginSchema,
  type LoginFormData,
} from "@/pages/auth/model/loginSchema";
import TextSeperator from "@/shared/components/text-separator";
import { GoogleLogo } from "@/shared/components/logos";

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

  const { mutate: login, isPending, error } = useLogin();

  const handleLogin = (data: LoginFormData) => {
    login(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {
          navigate({ to: search.redirect ?? "/" });
        },
      }
    );
  };

  return (
    <BaseLayout>
      <div className="text-center space-y-3">
        <div>
          <h1 className="text-3xl text-primary font-extrabold">로그인</h1>
          <p className="text-sm text-muted-foreground mt-1">
            FlipNote에 오신 걸 환영합니다!
          </p>
        </div>
      </div>
      <div className="text-center space-y-3">
        <Card className="mt-4 py-16 px-8 max-w-md mx-auto border-none shadow-none">
          <CardContent>
            <form id="login" className="w-full space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium text-xs">
                  이메일
                </Label>
                <Input
                  id="email"
                  placeholder="이메일을 입력해주세요"
                  {...register("email")}
                />
                <ErrorMessage>{errors.email?.message}</ErrorMessage>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-medium text-xs">
                  비밀번호
                </Label>
                <PasswordInput
                  id="password"
                  placeholder="비밀번호를 입력해주세요"
                  {...register("password")}
                />
                <ErrorMessage>{errors.password?.message}</ErrorMessage>
              </div>
              {error && (
                <ErrorMessage className="text-center">
                  {error instanceof Error
                    ? error.message
                    : "로그인을 실패했습니다. 다시 시도해주세요"}
                </ErrorMessage>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex-col space-y-6 ">
            <Button
              form="login"
              type="submit"
              variant="default"
              className="w-full"
              onClick={handleSubmit(handleLogin)}
              disabled={isPending}
            >
              {isPending ? "로그인 중..." : "로그인"}
            </Button>

            <TextSeperator>또는</TextSeperator>

            <div className="w-full space-y-2">
              <Button variant="outline" asChild>
                <a
                  className="w-full text-gray-600"
                  href={`${new URL(import.meta.env.VITE_BASE_URL).origin}/oauth2/authorization/google`}
                >
                  <GoogleLogo />
                  Google로 로그인
                </a>
              </Button>
            </div>

            <ul className="w-full text-xs text-left flex gap-2 justify-center">
              <li>
                <Link
                  to="/auth/register"
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  계정이 없으신가요?
                </Link>
              </li>
              <span>|</span>
              <li>
                <Link
                  to="/reset-password"
                  className="text-indigo-600 hover:text-indigo-700"
                >
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
