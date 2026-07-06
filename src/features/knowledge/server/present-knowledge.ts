import type { Knowledge } from "./knowledge-entity";
import type { Knowledge as KnowledgeDto } from "../types/knowledge";

/**
 * ナレッジEntityを画面表示用DTOへ変換する（Dateはシリアライズ可能なISO文字列にする）。
 */
export function presentKnowledge(knowledge: Knowledge): KnowledgeDto {
  const props = knowledge.toProps();
  return {
    ...props,
    updatedAt: props.updatedAt?.toISOString()
  };
}
