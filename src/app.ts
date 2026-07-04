import express from "express";
import type { KnowledgeApiPorts } from "./contexts/knowledge/application/ports/knowledge-api-ports.js";
import { errorHandler } from "./shared/http/error-handler.js";
import { createRouter } from "./contexts/knowledge/interface-adapters/http/routes.js";

/**
 * Expressアプリケーションを生成する。
 *
 * @param repository ナレッジAPIが必要とするPortの集合。
 * @returns 設定済みのExpressアプリケーション。
 */
export function createApp(repository: KnowledgeApiPorts): express.Express {
  const app = express();

  app.use(express.json());
  app.use(createRouter(repository));
  app.use(errorHandler);

  return app;
}
