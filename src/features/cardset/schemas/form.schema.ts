import { z } from "zod";
import { GROUP_CATEGORIES } from "@/domain/group/types";

const cardsetFormBaseSchema = z.object({
  name: z.string().min(1, "카드셋명을 입력해주세요"),
  publicVisible: z.boolean().optional(),
  category: z.enum(GROUP_CATEGORIES, {
    message: "하나 이상의 카테고리를 선택해주세요",
  }),
  hashtag: z.array(z.object({ name: z.string().min(1, "해시태그를 입력해주세요") })),
  managers: z.array(z.number()),
});

export const cardsetCreateFormSchema = cardsetFormBaseSchema.extend({
  imageRefId: z.number().optional(),
});

export const cardsetUpdateFormSchema = cardsetFormBaseSchema.extend({
  imageRefId: z.number().optional(),
});

export type CardsetCreateFormField = z.infer<typeof cardsetCreateFormSchema>;
export type CardsetUpdateFormField = z.infer<typeof cardsetUpdateFormSchema>;
