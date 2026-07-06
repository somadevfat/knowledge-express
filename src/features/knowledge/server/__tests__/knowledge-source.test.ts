import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GitHubKnowledgeSource,
  InMemoryKnowledgeSource,
  createKnowledgeSourceFromEnv,
  normalizeRepositoryName,
} from "../knowledge-source";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("normalizeRepositoryName", () => {
  it("正常系: プレーンなリポジトリ名はそのまま返す", () => {
    expect(normalizeRepositoryName("knowledge-wiki")).toBe("knowledge-wiki");
  });

  it("正常系: SSH形式のURLからリポジトリ名だけを取り出す", () => {
    expect(normalizeRepositoryName("git@github.com:owner/knowledge-wiki.git")).toBe(
      "knowledge-wiki",
    );
  });

  it("異常系: undefinedはundefinedのまま返す", () => {
    expect(normalizeRepositoryName(undefined)).toBeUndefined();
  });
});

describe("createKnowledgeSourceFromEnv", () => {
  it("正常系: GITHUB_OWNER/GITHUB_REPOSITORYがあればGitHubKnowledgeSourceを返す", () => {
    const source = createKnowledgeSourceFromEnv({
      GITHUB_OWNER: "somadevfat",
      GITHUB_REPOSITORY: "knowledge-wiki",
    });

    expect(source).toBeInstanceOf(GitHubKnowledgeSource);
  });

  it("異常系: GitHub設定が無い場合はサンプルのInMemoryKnowledgeSourceにフォールバックする", async () => {
    const source = createKnowledgeSourceFromEnv({});

    expect(source).toBeInstanceOf(InMemoryKnowledgeSource);
    const documents = await source.fetchAll();
    expect(documents.length).toBeGreaterThan(0);
  });
});

describe("GitHubKnowledgeSource.fetchAll", () => {
  it("正常系: ディレクトリを再帰的にたどり、.mdファイルの内容を取得する", async () => {
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = input.toString();
      if (url.includes("/contents/docs")) {
        return new Response(
          JSON.stringify([
            {
              type: "file",
              name: "controller.md",
              path: "docs/controller.md",
              download_url: "https://raw.githubusercontent.com/owner/repo/main/docs/controller.md",
              html_url: "https://github.com/owner/repo/blob/main/docs/controller.md",
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("raw.githubusercontent.com")) {
        return new Response("# Controller\n本文", { status: 200 });
      }
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const source = new GitHubKnowledgeSource({
      owner: "owner",
      repo: "repo",
      branch: "main",
      rootPath: "docs",
    });

    const documents = await source.fetchAll();

    expect(documents).toEqual([
      {
        path: "docs/controller.md",
        content: "# Controller\n本文",
        sourceUrl: "https://github.com/owner/repo/blob/main/docs/controller.md",
      },
    ]);
  });

  it("異常系: Contents APIが失敗した場合はエラーを投げる", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Not Found", { status: 404 })),
    );

    const source = new GitHubKnowledgeSource({
      owner: "owner",
      repo: "repo",
      branch: "main",
      rootPath: "docs",
    });

    await expect(source.fetchAll()).rejects.toThrow(/status=404/);
  });
});
