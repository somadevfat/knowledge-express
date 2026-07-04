import "dotenv/config";
import { createApp } from "./app.js";
import { createDatabase } from "./contexts/knowledge/infrastructure/database/client.js";
import { DrizzleKnowledgeRepository } from "./contexts/knowledge/infrastructure/repositories/drizzle-knowledge-repository/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl === undefined) {
  throw new Error("DATABASE_URL is required.");
}

const port = Number(process.env.PORT ?? 3000);
const { db } = createDatabase(databaseUrl);
const repository = new DrizzleKnowledgeRepository(db);
const app = createApp(repository);

app.listen(port, () => {
  console.log(`Knowledge API is running on http://localhost:${port}`);
});
