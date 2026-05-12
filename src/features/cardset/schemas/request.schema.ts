import { z } from "zod";
import { GROUP_CATEGORIES } from "@/domain/group/types";

const cardsetRequestBaseSchema = z.object({
  name: z.string(),
  groupId: z.number(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  hashtag: z.string(),
  category: z.enum(GROUP_CATEGORIES),
  managerIds: z.array(z.number()),
});

export const cardsetCreateRequestSchema = cardsetRequestBaseSchema.extend({
  imageRefId: z.number().optional(),
});

export const cardsetUpdateRequestSchema = cardsetRequestBaseSchema.partial().extend({
  imageRefId: z.number().optional(),
});

export type CardsetCreateRequest = z.infer<typeof cardsetCreateRequestSchema>;
export type CardsetUpdateRequest = z.infer<typeof cardsetUpdateRequestSchema>;
