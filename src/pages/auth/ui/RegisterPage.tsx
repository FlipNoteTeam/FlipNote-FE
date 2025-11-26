import { useState, type MouseEvent } from "react";
import { Card, CardContent, CardFooter } from "@/shared/components/card";
import { Input } from "@/shared/components/input";
import { Button } from "@/shared/components/button";
import { Label } from "@/shared/components/label";
import { Checkbox } from "@/shared/components/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import BaseLayout from "@/shared/layouts/base-layout";
import { Sparkles } from "lucide-react";
import { useRegister } from "../model/useRegister";
import { registerSchema, type RegisterFormData } from "../model/registerSchema";
import type { UserRegisterRequest } from "@/shared/apis";

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    getValues,
    getFieldState,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      smsAgree: true,
    },
  });

  const navigate = useNavigate();
  const [activateEmailVerificationField, setActivateEmailVerificationField] =
    useState(false);

  const {
    register: registerUser,
    sendCode,
    verifyEmail,
    isRegisterPending,
    isSendingCode,
    isVerifyingEmail,
  } = useRegister({
    onRegisterSuccess: () => {
      navigate({ to: "/auth/login" });
    },
    onCodeSent: () => {
      setActivateEmailVerificationField(true);
    },
  });

  // 인증코드 발송 핸들러
  const handleSendVerificationCode = (
    e: MouseEvent,
    email: string,
    isEmailValid: boolean
  ) => {
    e.preventDefault();
    if (email && isEmailValid) {
      sendCode({ email });
    }
  };

  // 이메일 인증 핸들러
  const handleVerifyEmail = (e: MouseEvent, email: string, code: string) => {
    e.preventDefault();
    if (email && code) {
      verifyEmail({ email, code });
    }
  };

  // 회원가입 제출 핸들러
  const handleRegister = (data: RegisterFormData) => {
    const payload: UserRegisterRequest = {
      email: data.email,
      name: data.nickname,
      nickname: data.nickname,
      password: data.password,
      smsAgree: data.smsAgree ?? true,
      normalizedPhone: data.phone,
    };
    registerUser(payload);
  };

  return (
    <BaseLayout>
      {/* Logo & Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary">FlipNote</h1>
          <p className="text-sm text-muted-foreground mt-1">
            가입하고 학습을 시작하세요
          </p>
        </div>
      </div>
      <Card className="mt-4 py-16 px-8 max-w-md mx-auto">
        <CardContent className="w-full space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              이메일
            </Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                autoComplete="off"
                disabled={activateEmailVerificationField}
                {...register("email")}
              />
              {errors.email && (
                <span className="text-sm text-red-500">
                  {errors.email.message}
                </span>
              )}
              <Button
                onClick={(e) =>
                  handleSendVerificationCode(
                    e,
                    getValues("email"),
                    !getFieldState("email").invalid
                  )
                }
                disabled={activateEmailVerificationField || isSendingCode}
              >
                {isSendingCode ? "발송 중..." : "인증코드받기"}
              </Button>
            </div>
            {activateEmailVerificationField && (
              <>
                <div className="flex gap-2">
                  <Input
                    id="email-verify"
                    placeholder="인증코드"
                    {...register("emailVerifyCode")}
                  />

                  <Button
                    onClick={(e) =>
                      handleVerifyEmail(
                        e,
                        getValues("email"),
                        getValues("emailVerifyCode")
                      )
                    }
                    disabled={isVerifyingEmail}
                  >
                    {isVerifyingEmail ? "확인 중..." : "제출하기"}
                  </Button>
                </div>
                {errors.emailVerifyCode && (
                  <span className="text-sm text-red-500">
                    {errors.emailVerifyCode.message}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              type="password"
              id="password"
              placeholder="비밀번호를 입력해주세요"
              {...register("password")}
            />
            {errors.password && (
              <span className="text-sm text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordDoublecheck">비밀번호 확인</Label>
            <Input
              type="password"
              id="passwordDoublecheck"
              placeholder="비밀번호를 한번 더 입력해주세요"
              {...register("passwordDoublecheck")}
            />
            {errors.passwordDoublecheck && (
              <span className="text-sm text-red-500">
                {errors.passwordDoublecheck.message}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              placeholder="닉네임을 입력해주세요"
              {...register("nickname")}
            ></Input>
            {errors.nickname && (
              <span className="text-sm text-red-500">
                {errors.nickname.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">휴대폰번호</Label>
            <Input
              type="tel"
              id="phone"
              placeholder="010-xxxx-xxxx"
              {...register("phone")}
            ></Input>
          </div>

          <div className="flex gap-2">
            <Checkbox id="accept" />
            <Label htmlFor="accept">SMS 수신여부 동의</Label>
          </div>
          {/* <Link to="/reset-password">비밀번호 찾기</Link> */}
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            variant="default"
            className="w-full"
            onClick={handleSubmit(handleRegister)}
            disabled={isRegisterPending}
          >
            {isRegisterPending ? "가입 중..." : "가입하기"}
          </Button>

          <span className="text-sm">
            소셜계정 연동은 회원가입이후 가능합니다.
          </span>
        </CardFooter>
      </Card>
    </BaseLayout>
  );
};

export default RegisterPage;
