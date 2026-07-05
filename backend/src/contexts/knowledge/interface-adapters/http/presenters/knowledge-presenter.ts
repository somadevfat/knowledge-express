import type { Knowledge } from "../../../domain/entities/knowledge.js";

export type KnowledgeResponse = {
  id: string;
  title: string;
  body: string;
  excerpt: string;
  tags: string[];
  category: string;
  path: string;
  order: number;
  sourceUrl: string;
  updatedAt?: string;
};

/**
 * ナレッジEntityをHTTPレスポンス用DTOへ変換する。
 *
 * @param knowledge 変換対象のナレッジEntity。
 * @returns HTTPレスポンス用のナレッジDTO。
 */
export function presentKnowledge(knowledge: Knowledge): KnowledgeResponse {
  const props = knowledge.toProps();
  return {
    ...props,
    updatedAt: props.updatedAt?.toISOString()
  };
}

