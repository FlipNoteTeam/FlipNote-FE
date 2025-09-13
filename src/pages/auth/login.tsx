import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/shared/components/card";
import { Input } from "@/shared/components/input";
import { Button } from "@/shared/components/button";
import { Label } from "@/shared/components/label";
import { Separator } from "@/shared/components/separator";
import { authApi, type UserLoginRequest } from "@/shared/apis";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import useAuthStore from "@/stores/useAuthStore";

type FieldState = UserLoginRequest;

const Login = () => {
  const navigate = useNavigate({ from: "/auth/register" });
  const { getValues, register } = useForm<FieldState>({});
  const updateAccessToken = useAuthStore((state) => state.updateAccessToken);
  const { mutate: login } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      updateAccessToken(res.data.data.accessToken);
      navigate({ to: "/" });
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
    <Card>
      <CardHeader className="text-center">
        <h3>FlipNote에 오신 것을 환영합니다!</h3>
      </CardHeader>
      <CardContent>
        <Label htmlFor="email">이메일</Label>
        <Input id="email" {...register("email")} />
        <Label htmlFor="password">비밀번호</Label>
        <Input type="password" id="password" {...register("password")}></Input>
        {/* <Link to="/reset-password">비밀번호 찾기</Link> */}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" variant="default" onClick={handleSubmit}>
          로그인
        </Button>
        <Separator />
        <p>또는 소셜 계정으로 로그인</p>
        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
        <Button variant="outline" className="w-full">
          Login with Kakao
        </Button>
        <Button variant="outline" className="w-full">
          Login with Github
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Login;
