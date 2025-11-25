import { Card, CardContent, CardFooter } from "@/shared/components/card";
import { Input } from "@/shared/components/input";
import { Button } from "@/shared/components/button";
import { Label } from "@/shared/components/label";
import { Checkbox } from "@/shared/components/checkbox";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { authApi, type UserRegisterRequest } from "@/shared/apis";
import { useState, type MouseEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import BaseLayout from "@/shared/layouts/base-layout";
import { Sparkles } from "lucide-react";
// import { Link } from "@tanstack/react-router";

// type Props = {};

type FieldState = UserRegisterRequest & {
  emailVerifyCode: string;
  passwordDoublecheck: string;
};
const Register = () => {
  const navigate = useNavigate();
  const { getFieldState, getValues, register } = useForm<FieldState>({
    defaultValues: {
      smsAgree: true,
    },
  });
  const [activateEmailVerificationField, setActivateEmailVerificationField] =
    useState(false);

  const { mutate: registerApi } = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      navigate({ to: "/auth/login" });
    },
  });

  const { mutate: sendEmailVerificationCode } = useMutation({
    mutationFn: authApi.sendEmailVerificationCode,
  });

  const handleClickGetVerifyEmailCode = (e: MouseEvent) => {
    e.preventDefault();

    setActivateEmailVerificationField(true);
    const email = getValues("email");
    const emailField = getFieldState("email");
    if (email && !emailField.invalid) sendEmailVerificationCode({ email });
  };

  const { mutate: verifyEmail } = useMutation({
    mutationFn: authApi.verifyEmail,
  });

  const handleClickVerifyEmail = (e: MouseEvent) => {
    e.preventDefault();

    const email = getValues("email");
    const emailVerifyCode = getValues("emailVerifyCode");

    if (email && emailVerifyCode)
      verifyEmail({
        email,
        code: emailVerifyCode,
      });
  };

  const convertFieldStateToPayload = (
    fieldState: FieldState
  ): UserRegisterRequest => {
    return {
      email: fieldState.email,
      name: fieldState.name || fieldState.nickname,
      nickname: fieldState.nickname,
      password: fieldState.password,
      smsAgree: true,
      normalizedPhone: fieldState.phone,
    };
  };

  const handleSubmit = () => {
    const registerBody = convertFieldStateToPayload(getValues());
    registerApi(registerBody);
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
            <Input
              id="email"
              type="email"
              autoComplete="off"
              disabled={activateEmailVerificationField}
              {...register("email")}
            />
            <Button
              onClick={handleClickGetVerifyEmailCode}
              disabled={activateEmailVerificationField}
            >
              인증코드받기
            </Button>
            {activateEmailVerificationField && (
              <>
                <Input
                  id="email-verify"
                  placeholder="인증코드"
                  {...register("emailVerifyCode")}
                />
                <Button onClick={handleClickVerifyEmail}>제출하기</Button>
              </>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
          </div>
          <Input type="password" id="password" {...register("password")} />

          <div className="space-y-2">
            <Label htmlFor="passwordDoublecheck">비밀번호 확인</Label>
            <Input
              type="password"
              id="passwordDoublecheck"
              {...register("passwordDoublecheck")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input id="nickname" {...register("nickname")}></Input>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">휴대폰번호</Label>
            <Input type="tel" id="phone" {...register("phone")}></Input>
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
            onClick={handleSubmit}
          >
            가입하기
          </Button>

          <span className="text-sm">
            소셜계정 연동은 회원가입이후 가능합니다.
          </span>
        </CardFooter>
      </Card>
    </BaseLayout>
  );
};

export default Register;
