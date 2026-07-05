import type { ErrorRequestHandler } from "express";
import { NotFoundError } from "../../contexts/knowledge/application/errors/not-found-error.js";
import { DomainError } from "../../contexts/knowledge/domain/errors/domain-error.js";

export type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type OpenApiValidationError = Error & {
  status?: number;
  errors?: unknown;
};

/**
 * アプリケーション内のエラーをHTTPレスポンスへ変換するExpressミドルウェア。
 *
 * @param error 捕捉した未知のエラー。
 * @param _req Expressのリクエスト。
 * @param res Expressのレスポンス。
 * @param _next Expressの次ミドルウェア呼び出し関数。
 * @returns 戻り値はない。
 */
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next): void => {
  if (isOpenApiValidationError(error)) {
    res.status(error.status).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        details: error.errors
      }
    } satisfies ErrorResponse);
    return;
  }

  if (error instanceof DomainError) {
    res.status(400).json({
      error: {
        code: "DOMAIN_ERROR",
        message: error.message
      }
    } satisfies ErrorResponse);
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: error.message
      }
    } satisfies ErrorResponse);
    return;
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected error occurred."
    }
  } satisfies ErrorResponse);
};

function isOpenApiValidationError(error: unknown): error is OpenApiValidationError & { status: number } {
  return error instanceof Error && typeof (error as OpenApiValidationError).status === "number";
}
