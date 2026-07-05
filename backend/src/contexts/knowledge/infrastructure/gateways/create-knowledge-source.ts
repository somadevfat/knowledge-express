import type { FetchKnowledgeSourcePort } from "../../application/ports/fetch-knowledge-source-port.js";
import { GitHubKnowledgeSource } from "./github-knowledge-source.js";
import { createSampleKnowledgeSource } from "./in-memory-knowledge-source.js";

/**
 * 環境変数からナレッジソースGatewayを生成する。
 *
 * @param env Node.jsの環境変数。
 * @returns GitHub設定があればGitHub Gateway、なければサンプルGateway。
 */
export function createKnowledgeSourceFromEnv(env: NodeJS.ProcessEnv): FetchKnowledgeSourcePort {
  const owner = readOptionalEnv(env.GITHUB_OWNER);
  const repo = normalizeRepositoryName(readOptionalEnv(env.GITHUB_REPOSITORY));

  if (owner === undefined || repo === undefined) {
    return createSampleKnowledgeSource();
  }

  return new GitHubKnowledgeSource({
    owner,
    repo,
    branch: readOptionalEnv(env.GITHUB_BRANCH) ?? "main",
    rootPath: readOptionalEnv(env.GITHUB_KNOWLEDGE_PATH) ?? "",
    token: readOptionalEnv(env.GITHUB_TOKEN)
  });
}

function readOptionalEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed.length === 0 ? undefined : trimmed;
}

function normalizeRepositoryName(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const sshMatch = /github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/.exec(value);
  if (sshMatch !== null) {
    return sshMatch[2];
  }

  return value.replace(/\.git$/, "");
}
