import "server-only";
import { createKnowledgeSourceFromEnv } from "../server/knowledge-source";
import {
  getKnowledge as getKnowledgeUseCase,
  getKnowledgeTree as getKnowledgeTreeUseCase,
  listKnowledge,
  searchKnowledge as searchKnowledgeUseCase,
} from "../server/use-cases";
import { presentKnowledge } from "../server/present-knowledge";
import { fetchSiteConfig } from "../server/site-config";
import type { Knowledge, KnowledgeTreeNode } from "../types/knowledge";

export { NotFoundError } from "../server/errors";
export type { SiteConfig } from "../server/site-config";

const source = createKnowledgeSourceFromEnv(process.env);

export async function getKnowledgeList(): Promise<Knowledge[]> {
  const articles = await listKnowledge(source);
  return articles.map(presentKnowledge);
}

export async function getKnowledge(id: string): Promise<Knowledge> {
  const article = await getKnowledgeUseCase(source, id);
  return presentKnowledge(article);
}

export async function getKnowledgeTree(): Promise<KnowledgeTreeNode[]> {
  return getKnowledgeTreeUseCase(source);
}

export async function searchKnowledge(params: {
  q?: string;
  tag?: string;
}): Promise<Knowledge[]> {
  const articles = await searchKnowledgeUseCase(source, params);
  return articles.map(presentKnowledge);
}

export async function getSiteConfig() {
  return fetchSiteConfig(process.env);
}
