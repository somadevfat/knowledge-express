import type { RequestHandler } from "express";
import * as OpenApiValidator from "express-openapi-validator";
import path from "node:path";

const openApiSpecPath = path.resolve(process.cwd(), "openapi/openapi.yaml");

/**
 * OpenAPI定義を正としてHTTPリクエストを検証するmiddlewareを生成する。
 *
 * @returns Express middleware群。
 */
export function createOpenApiValidator(): RequestHandler[] {
  return OpenApiValidator.middleware({
    apiSpec: openApiSpecPath,
    validateRequests: true,
    validateResponses: false
  }) as RequestHandler[];
}
