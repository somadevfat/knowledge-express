import { describe, expect, it } from "vitest";
import { parseFrontmatterBlock } from "../frontmatter";

describe("parseFrontmatterBlock", () => {
  it("正常系: key:valueとリスト形式のfrontmatterを解析する", () => {
    /* Arrange */
    const content = `---
title: "Sample Title"
order: 5
tags:
  - a
  - b
---

# 本文
続き`;

    /* Act */
    const { frontmatter, body } = parseFrontmatterBlock(content);

    /* Assert */
    expect(frontmatter).toEqual({
      title: "Sample Title",
      order: "5",
      tags: ["a", "b"],
    });
    expect(body).toBe("# 本文\n続き");
  });

  it("正常系: カンマ区切りのtagsも扱えるようにする（呼び出し側での変換用に文字列のまま返す）", () => {
    /* Arrange */
    const content = `---
tags: a, b, c
---
本文`;

    /* Act */
    const { frontmatter } = parseFrontmatterBlock(content);

    /* Assert */
    expect(frontmatter.tags).toBe("a, b, c");
  });

  it("異常系: frontmatterブロックが無い場合は空オブジェクトと本文全体を返す", () => {
    /* Arrange */
    const content = "# 見出しだけ\n本文";

    /* Act */
    const { frontmatter, body } = parseFrontmatterBlock(content);

    /* Assert */
    expect(frontmatter).toEqual({});
    expect(body).toBe("# 見出しだけ\n本文");
  });

  it("異常系: frontmatterの終端`---`が無い場合は空オブジェクト扱いにする", () => {
    /* Arrange */
    const content = "---\ntitle: 終端なし\n本文だけ続く";

    /* Act */
    const { frontmatter, body } = parseFrontmatterBlock(content);

    /* Assert */
    expect(frontmatter).toEqual({});
    expect(body).toBe("---\ntitle: 終端なし\n本文だけ続く");
  });
});
