import "dotenv/config";
import { createApp } from "./app.js";
import { createKnowledgeSourceFromEnv } from "./contexts/knowledge/infrastructure/gateways/create-knowledge-source.js";

const port = Number(process.env.PORT ?? 3000);
const source = createKnowledgeSourceFromEnv(process.env);
const app = createApp(source);

app.listen(port, () => {
  console.log(`Knowledge API is running on http://localhost:${port}`);
});
