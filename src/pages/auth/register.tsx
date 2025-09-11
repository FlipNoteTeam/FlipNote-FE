import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/shared/components/card";
import { Input } from "@/shared/components/input";
import { Button } from "@/shared/components/button";
import { Label } from "@/shared/components/label";
import { Checkbox } from "@/shared/components/checkbox";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { authApi, type UserRegisterRequest } from "@/shared/apis";
import { useState, type MouseEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
// import { Link } from "@tanstack/react-router";

// type Props = {};

type FieldState = UserRegisterRequest & {
  emailVerifyCode: string;
  passwordDoublecheck: string;
};
const Register = () => {
  const navigate = useNavigate({ from: "/auth/register" });
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
    <Card>
      <CardHeader className="text-center">
        <h3>FlipNote에 오신 것을 환영합니다!</h3>
      </CardHeader>
      <CardContent>
        <Label htmlFor="email">이메일</Label>
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
        <Label htmlFor="password">비밀번호</Label>
        <Input type="password" id="password" {...register("password")}></Input>
        <Label htmlFor="passwordDoublecheck">비밀번호 확인</Label>
        <Input
          type="password"
          id="passwordDoublecheck"
          {...register("passwordDoublecheck")}
        ></Input>
        <Label htmlFor="nickname">닉네임</Label>
        <Input id="nickname" {...register("nickname")}></Input>
        <Label htmlFor="phone">휴대폰번호</Label>
        <Input type="tel" id="phone" {...register("phone")}></Input>
        {/* <Button>인증하기</Button> */}

        <Checkbox id="accept" />
        <Label htmlFor="accept">SMS 수신여부 동의</Label>
        {/* <Link to="/reset-password">비밀번호 찾기</Link> */}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" variant="default" onClick={handleSubmit}>
          회원가입
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Register;
