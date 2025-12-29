import { useState, type MouseEvent } from "react";
import { Card, CardContent, CardFooter } from "@/shared/components/card";
import { Input } from "@/shared/components/input";
import { PhoneInput } from "@/shared/components/phone-input";
import { PasswordInput } from "@/shared/components/password-input";
import { ErrorMessage } from "@/shared/components/error-message";
import { Button } from "@/shared/components/button";
import { Label } from "@/shared/components/label";
import { Checkbox } from "@/shared/components/checkbox";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import BaseLayout from "@/shared/layouts/base-layout";
import { useRegister } from "../model/useRegister";
import { registerSchema, type RegisterFormData } from "../model/registerSchema";
import type { UserRegisterRequest } from "@/shared/apis";

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    getValues,
    getFieldState,
    control,
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
      <div className="text-center space-y-3">
        <div>
          <h1 className="text-3xl text-primary font-extrabold">회원가입</h1>
          <p className="text-sm text-muted-foreground mt-1">
            회원가입을 통해 FlipNote의 다양한 기능을 이용해보세요!
          </p>
        </div>
      </div>
      <Card className="p-8 max-w-md mx-auto border-none shadow-none">
        <CardContent className="w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium text-xs">
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
            <ErrorMessage>{errors.email?.message}</ErrorMessage>
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
                <ErrorMessage>{errors.emailVerifyCode?.message}</ErrorMessage>
              </>
            )}
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

          <div className="space-y-2">
            <Label
              htmlFor="passwordDoublecheck"
              className="font-medium text-xs"
            >
              비밀번호 확인
            </Label>
            <PasswordInput
              id="passwordDoublecheck"
              placeholder="비밀번호를 한번 더 입력해주세요"
              {...register("passwordDoublecheck")}
            />
            <ErrorMessage>{errors.passwordDoublecheck?.message}</ErrorMessage>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname" className="font-medium text-xs">
              닉네임
            </Label>
            <Input
              id="nickname"
              placeholder="닉네임을 입력해주세요"
              {...register("nickname")}
            ></Input>
            <ErrorMessage>{errors.nickname?.message}</ErrorMessage>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="font-medium text-xs">
              휴대폰번호
            </Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  id="phone"
                  placeholder="010-xxxx-xxxx"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex gap-2">
            <Checkbox id="accept" {...register("smsAgree")} />
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

          <div className="text-xs text-indigo-800">
            회원가입 이후 소셜계정을 연동할 수 있습니다.
          </div>
        </CardFooter>
      </Card>
    </BaseLayout>
  );
};

export default RegisterPage;
