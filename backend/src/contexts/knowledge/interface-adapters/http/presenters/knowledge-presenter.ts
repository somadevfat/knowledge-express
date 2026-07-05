import type { Knowledge } from "../../../domain/entities/knowledge.js";
import type { components } from "../../../../../shared/api/schema.gen.js";

export type KnowledgeResponse = components["schemas"]["Knowledge"];

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

