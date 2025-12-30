import { GROUP_CATEGORIES } from "@/domain/group/types";
import { z } from "zod";

export const createGroupRequestSchema = z.object({
  name: z.string().min(1),
  category: z.enum(GROUP_CATEGORIES),
  description: z.string(),
  applicationRequired: z.boolean(),
  publicVisible: z.boolean(),
  maxMember: z.number().min(1).max(100),
  image: z.string().optional(),
});

export type CreateGroupRequest = z.infer<typeof createGroupRequestSchema>;
