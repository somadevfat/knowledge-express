import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "../../database/schema.js";
import type { knowledgeArticles } from "../../database/schema.js";

export type KnowledgeDatabase = NodePgDatabase<typeof schema>;
export type KnowledgeRow = typeof knowledgeArticles.$inferSelect;
