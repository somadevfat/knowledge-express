import type { KnowledgeSourceDocument } from "./knowledge-entity";

/**
 * GitHubなど外部ナレッジソースからMarkdown文書を取得するためのPort。
 */
export interface FetchKnowledgeSourcePort {
  /**
   * ソース配下にあるMarkdown文書をすべて取得する。
   */
  fetchAll(): Promise<KnowledgeSourceDocument[]>;
}

/**
 * {@link GitHubKnowledgeSource}の生成に必要な設定値。
 */
export type GitHubKnowledgeSourceConfig = {
  owner: string;
  repo: string;
  branch: string;
  rootPath: string;
  token?: string;
};

/**
 * GitHub Contents APIが返すファイル/ディレクトリ1件分の情報。
 */
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
  /**
   * @param config 取得先リポジトリ・パス・認証トークンなどの設定。
   */
  constructor(private readonly config: GitHubKnowledgeSourceConfig) {}

  /**
   * `rootPath`配下を再帰的にたどり、`.md`ファイルをすべて取得する。
   */
  async fetchAll(): Promise<KnowledgeSourceDocument[]> {
    return this.fetchDirectory(this.config.rootPath);
  }

  /**
   * 指定ディレクトリ配下（サブディレクトリ含む）の`.md`ファイルを再帰的に集める。
   *
   * @param path リポジトリルートからの相対パス。
   */
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

  /**
   * GitHub Contents APIで指定パスの一覧（ファイル/ディレクトリ）を取得する。
   *
   * @param path リポジトリルートからの相対パス。
   * @throws {Error} レスポンスが失敗ステータスの場合。
   */
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

  /**
   * `download_url`からMarkdownの生テキストを取得する。
   *
   * @param url ファイルのraw取得URL。
   * @throws {Error} レスポンスが失敗ステータスの場合。
   */
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

  /**
   * GitHub APIリクエスト共通のヘッダーを組み立てる（tokenがあればBearer認証を付与）。
   */
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
  /**
   * @param documents 返却するMarkdown文書一覧。
   */
  constructor(private readonly documents: KnowledgeSourceDocument[]) {}

  /**
   * 登録済みのMarkdown文書をすべて返す（updatedAtはコピーして返す）。
   */
  async fetchAll(): Promise<KnowledgeSourceDocument[]> {
    return this.documents.map((document) => ({
      ...document,
      updatedAt: document.updatedAt === undefined ? undefined : new Date(document.updatedAt)
    }));
  }
}

/**
 * GitHub設定が無い環境（ローカル動作確認など）向けのサンプル記事ソースを作る。
 */
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
 * ナレッジソース関連の環境変数（`process.env`のうち実際に読む部分だけ）。
 */
export type GitHubEnv = {
  GITHUB_OWNER?: string;
  GITHUB_REPOSITORY?: string;
  GITHUB_BRANCH?: string;
  GITHUB_KNOWLEDGE_PATH?: string;
  GITHUB_TOKEN?: string;
  [key: string]: string | undefined;
};

/**
 * 環境変数からナレッジソースを生成する。
 *
 * @param env 実行環境の環境変数。
 * @returns GitHub設定があればGitHub Gateway、なければサンプルソース。
 */
export function createKnowledgeSourceFromEnv(env: GitHubEnv): FetchKnowledgeSourcePort {
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

/**
 * 環境変数の値をトリムし、空文字列は未設定（undefined）として扱う。
 *
 * @param value 環境変数の生の値。
 */
export function readOptionalEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed.length === 0 ? undefined : trimmed;
}

/**
 * `GITHUB_REPOSITORY`がリポジトリ名・SSH URL・HTTPS URLのどれで指定されても
 * リポジトリ名だけを取り出す。
 *
 * @param value リポジトリ名またはgit URL。
 */
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
