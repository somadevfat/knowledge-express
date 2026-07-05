import type { FetchKnowledgeSourcePort } from "../../application/ports/fetch-knowledge-source-port.js";
import type { KnowledgeSourceDocument } from "../../domain/entities/knowledge.js";

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
  /**
   * GitHubナレッジソースを生成する。
   *
   * @param config GitHubリポジトリと取得対象パスの設定。
   */
  constructor(private readonly config: GitHubKnowledgeSourceConfig) {}

  /**
   * GitHubリポジトリ配下のMarkdown文書を再帰的に取得する。
   *
   * @returns GitHubから取得したMarkdown文書一覧。
   */
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
      headers: this.headers()
    });

    if (!response.ok) {
      throw new Error(`GitHub contents API failed. status=${response.status}`);
    }

    const body = (await response.json()) as GitHubContentItem | GitHubContentItem[];
    return Array.isArray(body) ? body : [body];
  }

  private async fetchRawMarkdown(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: this.headers()
    });

    if (!response.ok) {
      throw new Error(`GitHub raw content fetch failed. status=${response.status}`);
    }

    return response.text();
  }

  private headers(): HeadersInit {
    return {
      Accept: "application/vnd.github+json",
      "User-Agent": "clean-architecture-knowledge-api",
      ...(this.config.token === undefined ? {} : { Authorization: `Bearer ${this.config.token}` })
    };
  }
}

