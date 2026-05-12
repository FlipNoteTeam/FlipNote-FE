import { z } from "zod";
import { GROUP_CATEGORIES } from "@/domain/group/types";

export const createGroupRequestSchema = z.object({
  name: z.string().min(1).max(50),
  category: z.enum(GROUP_CATEGORIES),
  description: z.string(),
  joinPolicy: z.enum(["OPEN", "APPROVAL"]),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  maxMember: z.number().min(1).max(100),
  imageRefId: z.number().optional(),
});

export type CreateGroupRequest = z.infer<typeof createGroupRequestSchema>;
