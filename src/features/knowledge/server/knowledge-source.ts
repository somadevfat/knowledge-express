import type { KnowledgeSourceDocument } from "./knowledge-entity";

/**
 * GitHubなど外部ナレッジソースからMarkdown文書を取得するためのPort。
 */
export interface FetchKnowledgeSourcePort {
  fetchAll(): Promise<KnowledgeSourceDocument[]>;
}

export type GitHubKnowledgeSourceConfig = {
  owner: string;
  repo: string;
  branch: string;
  rootPath: string;
  token?: string;
};

type GitHubContentItem = {
  type: "file" | "dir";
  name: string;
  path: string;
  download_url: string | null;
  html_url: string;
};

/**
 * GitHub Contents APIからMarkdown記事を取得するGateway実装。
 */
export class GitHubKnowledgeSource implements FetchKnowledgeSourcePort {
  constructor(private readonly config: GitHubKnowledgeSourceConfig) {}

  async fetchAll(): Promise<KnowledgeSourceDocument[]> {
    return this.fetchDirectory(this.config.rootPath);
  }

  private async fetchDirectory(path: string): Promise<KnowledgeSourceDocument[]> {
    const items = await this.fetchContents(path);
    const documents: KnowledgeSourceDocument[] = [];

    for (const item of items) {
      if (item.type === "dir") {
        documents.push(...(await this.fetchDirectory(item.path)));
        continue;
      }

      if (item.type === "file" && item.name.toLowerCase().endsWith(".md") && item.download_url !== null) {
        documents.push({
          path: item.path,
          content: await this.fetchRawMarkdown(item.download_url),
          sourceUrl: item.html_url
        });
      }
    }

    return documents;
  }

  private async fetchContents(path: string): Promise<GitHubContentItem[]> {
    const encodedPath = path
      .split("/")
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join("/");
    const url = new URL(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${encodedPath}`
    );
    url.searchParams.set("ref", this.config.branch);

    const response = await fetch(url, {
      headers: this.headers(),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`GitHub contents API failed. status=${response.status}`);
    }

    const body = (await response.json()) as GitHubContentItem | GitHubContentItem[];
    return Array.isArray(body) ? body : [body];
  }

  private async fetchRawMarkdown(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: this.headers(),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`GitHub raw content fetch failed. status=${response.status}`);
    }

    return response.text();
  }

  private headers(): HeadersInit {
    return {
      Accept: "application/vnd.github+json",
      "User-Agent": "se-wiki-frontend",
      ...(this.config.token === undefined ? {} : { Authorization: `Bearer ${this.config.token}` })
    };
  }
}

/**
 * ローカル開発でGitHub設定がないときに使うインメモリのナレッジソース。
 */
export class InMemoryKnowledgeSource implements FetchKnowledgeSourcePort {
  constructor(private readonly documents: KnowledgeSourceDocument[]) {}

  async fetchAll(): Promise<KnowledgeSourceDocument[]> {
    return this.documents.map((document) => ({
      ...document,
      updatedAt: document.updatedAt === undefined ? undefined : new Date(document.updatedAt)
    }));
  }
}

function createSampleKnowledgeSource(): InMemoryKnowledgeSource {
  return new InMemoryKnowledgeSource([
    {
      path: "Clean Architecture/Controller.md",
      sourceUrl: "https://github.com/example/knowledge/blob/main/Clean%20Architecture/Controller.md",
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      content: `---
id: clean-architecture-controller
title: Controllerの責務
category: Clean Architecture
tags:
  - clean-architecture
  - controller
order: 10
---

# Controllerの責務

ControllerはHTTP入力をUseCaseへ渡し、結果をHTTPレスポンスへ変換します。`
    },
    {
      path: "Clean Architecture/UseCase.md",
      sourceUrl: "https://github.com/example/knowledge/blob/main/Clean%20Architecture/UseCase.md",
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      content: `---
id: clean-architecture-usecase
title: UseCaseの責務
category: Clean Architecture
tags:
  - clean-architecture
  - usecase
order: 20
---

# UseCaseの責務

UseCaseはアプリケーション固有の処理手順を表します。`
    }
  ]);
}

/**
 * 環境変数からナレッジソースを生成する。
 *
 * @param env 実行環境の環境変数。
 * @returns GitHub設定があればGitHub Gateway、なければサンプルソース。
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

export function readOptionalEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed.length === 0 ? undefined : trimmed;
}

export function normalizeRepositoryName(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const sshMatch = /github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/.exec(value);
  if (sshMatch !== null) {
    return sshMatch[2];
  }

  return value.replace(/\.git$/, "");
}
