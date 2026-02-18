import { z } from "zod";

/**
 * 회원가입 폼 Validation Schema
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "이메일을 입력해주세요")
      .email("올바른 이메일 형식이 아닙니다"),
    emailVerifyCode: z.string().min(1, "인증코드를 입력해주세요"),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
    passwordDoublecheck: z.string().min(1, "비밀번호 확인을 입력해주세요"),
    nickname: z.string().min(1, "닉네임을 입력해주세요"),
    phone: z.string().optional(),
    smsAgree: z.boolean().optional(),
  })
  .refine((data) => data.password === data.passwordDoublecheck, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordDoublecheck"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
