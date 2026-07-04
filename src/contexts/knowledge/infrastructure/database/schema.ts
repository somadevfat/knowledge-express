import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const knowledgeArticles = pgTable("knowledge_articles", {
  id: uuid("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  tags: text("tags").array().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
});
