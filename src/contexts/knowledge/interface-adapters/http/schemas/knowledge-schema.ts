import { z } from "zod";

export const knowledgeIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const createKnowledgeSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1),
  tags: z.array(z.string().min(1)).optional()
});

export const updateKnowledgeSchema = z
  .object({
    title: z.string().min(1).max(120).optional(),
    body: z.string().min(1).optional(),
    tags: z.array(z.string().min(1)).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required."
  });

export const searchKnowledgeSchema = z.object({
  q: z.string().min(1).optional(),
  tag: z.string().min(1).optional()
});

export type CreateKnowledgeRequest = z.infer<typeof createKnowledgeSchema>;
export type UpdateKnowledgeRequest = z.infer<typeof updateKnowledgeSchema>;
export type SearchKnowledgeRequest = z.infer<typeof searchKnowledgeSchema>;
export type KnowledgeIdParams = z.infer<typeof knowledgeIdParamsSchema>;
