import express from "express";
import type { KnowledgeApiPorts } from "./contexts/knowledge/application/ports/knowledge-api-ports.js";
import { errorHandler } from "./shared/http/error-handler.js";
import { createOpenApiValidator } from "./shared/http/openapi-validator.js";
import { createRouter } from "./contexts/knowledge/interface-adapters/http/routes.js";

/**
 * Expressアプリケーションを生成する。
 *
 * @param source ナレッジAPIが必要とするPortの集合。
 * @returns 設定済みのExpressアプリケーション。
 */
export function createApp(source: KnowledgeApiPorts): express.Express {
  const app = express();

  app.use(express.json());
  app.use(createOpenApiValidator());
  app.use(createRouter(source));
  app.use(errorHandler);

  return app;
}
