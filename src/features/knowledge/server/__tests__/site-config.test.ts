import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SITE_CONFIG, fetchSiteConfig } from "../site-config";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchSiteConfig", () => {
  it("正常系: site.mdのfrontmatterからブランディング設定を取得する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          "---\ntitle: My Wiki\nsubtitle: サブタイトルです\nlogoText: MW\n---\n",
          { status: 200 },
        ),
      ),
    );

    const config = await fetchSiteConfig({
      GITHUB_OWNER: "somadevfat",
      GITHUB_REPOSITORY: "knowledge-wiki",
    });

    expect(config).toEqual({
      title: "My Wiki",
      subtitle: "サブタイトルです",
      logoText: "MW",
    });
  });

  it("異常系: GitHub設定が無い場合はfetchせずデフォルト値を返す", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const config = await fetchSiteConfig({});

    expect(config).toEqual(DEFAULT_SITE_CONFIG);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("異常系: site.mdが存在しない(404)場合はデフォルト値にフォールバックする", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Not Found", { status: 404 })),
    );

    const config = await fetchSiteConfig({
      GITHUB_OWNER: "somadevfat",
      GITHUB_REPOSITORY: "knowledge-wiki",
    });

    expect(config).toEqual(DEFAULT_SITE_CONFIG);
  });

  it("異常系: 通信自体が失敗した場合もデフォルト値にフォールバックする", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network error");
      }),
    );

    const config = await fetchSiteConfig({
      GITHUB_OWNER: "somadevfat",
      GITHUB_REPOSITORY: "knowledge-wiki",
    });

    expect(config).toEqual(DEFAULT_SITE_CONFIG);
  });
});
