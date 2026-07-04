import type { Knowledge } from "../../../domain/entities/knowledge.js";

export type KnowledgeResponse = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

/**
 * Domain EntityをHTTPレスポンスDTOへ変換する。
 *
 * @param knowledge 変換対象のDomain Entity。
 * @returns JSONとして返せるレスポンスボディ。
 */
export function presentKnowledge(knowledge: Knowledge): KnowledgeResponse {
  const props = knowledge.toProps();

  return {
    id: props.id,
    title: props.title,
    body: props.body,
    tags: props.tags,
    createdAt: props.createdAt.toISOString(),
    updatedAt: props.updatedAt.toISOString()
  };
}
