import type { components } from "@/shared/api/schema.gen";

export type Knowledge = components["schemas"]["Knowledge"];
export type KnowledgeTreeNode = components["schemas"]["KnowledgeTreeNode"];

export type ApiResponse<T> = {
  data: T;
};
