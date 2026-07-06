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
    /* Arrange */
    const value = "knowledge-wiki";

    /* Act */
    const result = normalizeRepositoryName(value);

    /* Assert */
    expect(result).toBe("knowledge-wiki");
  });

  it("正常系: SSH形式のURLからリポジトリ名だけを取り出す", () => {
    /* Arrange */
    const value = "git@github.com:owner/knowledge-wiki.git";

    /* Act */
    const result = normalizeRepositoryName(value);

    /* Assert */
    expect(result).toBe("knowledge-wiki");
  });

  it("異常系: undefinedはundefinedのまま返す", () => {
    /* Arrange */
    const value = undefined;

    /* Act */
    const result = normalizeRepositoryName(value);

    /* Assert */
    expect(result).toBeUndefined();
  });
});

describe("createKnowledgeSourceFromEnv", () => {
  it("正常系: GITHUB_OWNER/GITHUB_REPOSITORYがあればGitHubKnowledgeSourceを返す", () => {
    /* Arrange */
    const env = {
      GITHUB_OWNER: "somadevfat",
      GITHUB_REPOSITORY: "knowledge-wiki",
    };

    /* Act */
    const source = createKnowledgeSourceFromEnv(env);

    /* Assert */
    expect(source).toBeInstanceOf(GitHubKnowledgeSource);
  });

  it("異常系: GitHub設定が無い場合はサンプルのInMemoryKnowledgeSourceにフォールバックする", async () => {
    /* Arrange */
    const env = {};

    /* Act */
    const source = createKnowledgeSourceFromEnv(env);
    const documents = await source.fetchAll();

    /* Assert */
    expect(source).toBeInstanceOf(InMemoryKnowledgeSource);
    expect(documents.length).toBeGreaterThan(0);
  });
});

describe("GitHubKnowledgeSource.fetchAll", () => {
  it("正常系: ディレクトリを再帰的にたどり、.mdファイルの内容を取得する", async () => {
    /* Arrange */
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

    /* Act */
    const documents = await source.fetchAll();

    /* Assert */
    expect(documents).toEqual([
      {
        path: "docs/controller.md",
        content: "# Controller\n本文",
        sourceUrl: "https://github.com/owner/repo/blob/main/docs/controller.md",
      },
    ]);
  });

  it("異常系: Contents APIが失敗した場合はエラーを投げる", async () => {
    /* Arrange */
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

    /* Act */
    const act = source.fetchAll();

    /* Assert */
    await expect(act).rejects.toThrow(/status=404/);
  });
});
