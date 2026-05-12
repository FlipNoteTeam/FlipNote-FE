import { z } from "zod";

export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요")
    .email("올바른 이메일 형식이 아닙니다"),
});

export type PasswordResetRequestFormField = z.infer<typeof passwordResetRequestSchema>;

export const passwordResetSchema = z
  .object({
    token: z.string().min(1, "인증 토큰을 입력해주세요"),
    password: z
      .string()
      .min(1, "비밀번호를 입력해주세요")
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다",
      ),
    passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해주세요"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirm"],
  });

export type PasswordResetFormField = z.infer<typeof passwordResetSchema>;
