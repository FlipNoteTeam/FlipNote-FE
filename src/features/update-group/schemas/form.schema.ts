import { z } from "zod";
import { GROUP_CATEGORIES } from "@/domain/group/types";

export const updateGroupFormSchema = z.object({
  name: z.string().min(1, "그룹명을 입력해주세요"),
  category: z.enum(GROUP_CATEGORIES, {
    message: "하나 이상의 카테고리를 선택해주세요",
  }),
  description: z.string().optional(),
  applicationRequired: z.boolean(),
  publicVisible: z.boolean(),
  maxMember: z
    .number({ message: "숫자를 입력해주세요" })
    .min(1, "최소 인원은 1명입니다.")
    .max(100, "최대 인원은 100명입니다."),
  imageRefId: z.number().optional(),
});

export type UpdateGroupFormField = z.infer<typeof updateGroupFormSchema>;
