import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../shared/components/card";
import { Input } from "../../shared/components/input";

import { Button } from "../../shared/components/button";
import { Label } from "../../shared/components/label";
import { Checkbox } from "../../shared/components/checkbox";
// import { Link } from "@tanstack/react-router";

// type Props = {};
const Register = () => {
  return (
    <Card>
      <CardHeader className="text-center">
        <h1>FlipNote에 오신 것을 환영합니다!</h1>
      </CardHeader>
      <CardContent>
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" name="email" autoComplete="off"></Input>
        <Button>인증하기</Button>
        <Input id="email-verify" placeholder="인증코드"></Input>
        <Button>제출하기</Button>
        <Label htmlFor="password">비밀번호</Label>
        <Input type="password" id="password"></Input>
        <Label htmlFor="password-verify">비밀번호 확인</Label>
        <Input
          type="password"
          name="password-verify"
          id="password-verify"
        ></Input>
        <Label htmlFor="nickname">닉네임</Label>
        <Input id="nickname" name="nickname"></Input>
        <Label htmlFor="phone">휴대폰번호</Label>
        <Input type="tel" id="phone"></Input>
        <Button>인증하기</Button>
        <Label htmlFor="phone-verify">휴대폰번호 확인</Label>
        <Input
          id="phone-verify"
          name="phone-verify"
          placeholder="인증코드"
        ></Input>
        <Button>제출하기</Button>

        <Checkbox id="accept" />
        <Label htmlFor="accept">SMS 수신여부 동의</Label>
        {/* <Link to="/reset-password">비밀번호 찾기</Link> */}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" variant="default">
          회원가입
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Register;
