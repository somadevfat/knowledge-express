import { afterEach, describe, expect, it, vi } from "vitest";
import { expandCodeEmbeds, parseGitHubBlobUrl } from "../github-embed";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parseGitHubBlobUrl", () => {
  it("正常系: コミットSHA・パス・行範囲を持つパーマリンクを解析する", () => {
    expect(
      parseGitHubBlobUrl(
        "https://github.com/owner/repo/blob/abc123/src/index.ts#L1-L11",
      ),
    ).toEqual({
      owner: "owner",
      repo: "repo",
      ref: "abc123",
      path: "src/index.ts",
      startLine: 1,
      endLine: 11,
    });
  });

  it("正常系: 行範囲が無いURLはstartLine/endLineをundefinedにする", () => {
    expect(
      parseGitHubBlobUrl("https://github.com/owner/repo/blob/abc123/README.md"),
    ).toEqual({
      owner: "owner",
      repo: "repo",
      ref: "abc123",
      path: "README.md",
      startLine: undefined,
      endLine: undefined,
    });
  });

  it("異常系: GitHubのblob URLでない場合はundefinedを返す", () => {
    expect(parseGitHubBlobUrl("https://example.com/not-github")).toBeUndefined();
  });
});

describe("expandCodeEmbeds", () => {
  it("正常系: embedフェンスを取得したコード＋見出しリンクへ展開する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response("line1\nline2\nline3\nline4\n", { status: 200 }),
      ),
    );

    const markdown = [
      "説明文です。",
      "",
      "```embed:https://github.com/owner/repo/blob/abc123/src/index.ts#L2-L3",
      "```",
    ].join("\n");

    const result = await expandCodeEmbeds(markdown, undefined);

    expect(result).toContain("owner/repo — src/index.ts#L2-L3");
    expect(result).toContain("```typescript\nline2\nline3\n```");
  });

  it("正常系: embedフェンスが無ければそのまま返す", async () => {
    const markdown = "普通の記事本文です。";
    expect(await expandCodeEmbeds(markdown, undefined)).toBe(markdown);
  });

  it("異常系: 取得に失敗してもページを落とさずエラー内容を差し込む", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Not Found", { status: 404 })),
    );

    const markdown = "```embed:https://github.com/owner/repo/blob/abc123/missing.ts\n```";
    const result = await expandCodeEmbeds(markdown, undefined);

    expect(result).toContain("[embed error]");
    expect(result).toContain("status=404");
  });

  it("異常系: 不正なURLはGitHub blob URLではない旨のエラーを差し込む", async () => {
    const markdown = "```embed:not-a-url\n```";
    const result = await expandCodeEmbeds(markdown, undefined);

    expect(result).toContain("[embed error] Not a GitHub blob URL");
  });
});
