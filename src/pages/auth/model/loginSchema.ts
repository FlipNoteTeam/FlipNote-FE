import { z } from "zod";

/**
 * 로그인 폼 Validation Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .nonempty("이메일을 입력해주세요")
    .refine((val) => z.email().safeParse(val).success, {
      message: "올바른 이메일 형식이 아닙니다.",
    }),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
