import { describe, expect, it } from "vitest";
import { extractHeadings } from "../extract-headings";

describe("extractHeadings", () => {
  it("正常系: h2/h3見出しをslug付きで抽出し、h1と本文は無視する", () => {
    const headings = extractHeadings(
      [
        "# タイトル",
        "本文",
        "## はじめに",
        "文章",
        "### 詳細な話",
        "#### 深すぎる見出し",
      ].join("\n"),
    );

    expect(headings).toEqual([
      { id: "はじめに", depth: 2, text: "はじめに" },
      { id: "詳細な話", depth: 3, text: "詳細な話" },
    ]);
  });

  it("正常系: 見出し中の強調記号は表示テキストから取り除く", () => {
    const headings = extractHeadings("## **重要**な見出し");
    expect(headings[0].text).toBe("重要な見出し");
  });

  it("異常系: 見出しが無ければ空配列を返す", () => {
    expect(extractHeadings("ただの本文です。")).toEqual([]);
  });
});
