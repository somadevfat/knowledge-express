import { Knowledge } from "../../../domain/entities/knowledge.js";
import { knowledgeArticles } from "../../database/schema.js";
import { toKnowledgeEntity } from "./knowledge-row-mapper.js";
import type { KnowledgeDatabase } from "./types.js";

/**
 * ナレッジEntityをupsertで永続化する。
 *
 * @param db Drizzleのデータベースクライアント。
 * @param knowledge 保存するナレッジEntity。
 * @returns 保存後のナレッジEntity。
 */
export async function saveKnowledge(db: KnowledgeDatabase, knowledge: Knowledge): Promise<Knowledge> {
  const props = knowledge.toProps();

  const [row] = await db
    .insert(knowledgeArticles)
    .values(props)
    .onConflictDoUpdate({
      target: knowledgeArticles.id,
      set: {
        title: props.title,
        body: props.body,
        tags: props.tags,
        updatedAt: props.updatedAt
      }
    })
    .returning();

  return toKnowledgeEntity(row);
}
