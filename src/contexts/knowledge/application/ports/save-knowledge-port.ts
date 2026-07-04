import type { Knowledge } from "../../domain/entities/knowledge.js";

/**
 * ナレッジEntityを保存するためのPort。
 */
export interface SaveKnowledgePort {
  /**
   * ナレッジEntityを保存する。
   *
   * @param knowledge 保存するナレッジEntity。
   * @returns 保存後のナレッジEntity。
   */
  save(knowledge: Knowledge): Promise<Knowledge>;
}
