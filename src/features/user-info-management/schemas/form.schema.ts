import { z } from "zod";

export const userInfoFormSchema = z.object({
  nickname: z.string().min(1, "닉네임을 입력해주세요"),
  phone: z.string().optional(),
  smsAgree: z.boolean(),
  profileImageUrl: z.string().optional(),
});

export type UserInfoFormField = z.infer<typeof userInfoFormSchema>;
