import { describe, expect, it } from "vitest";
import { Knowledge } from "../knowledge-entity";
import { presentKnowledge } from "../present-knowledge";

describe("presentKnowledge", () => {
  it("正常系: updatedAtをISO文字列へ変換する", () => {
    /* Arrange */
    const knowledge = Knowledge.fromSourceDocument({
      path: "a.md",
      sourceUrl: "https://github.com/example/wiki/blob/main/a.md",
      content: "---\ntitle: A\n---\n\n本文",
      updatedAt: new Date("2026-01-02T03:04:05.000Z"),
    });

    /* Act */
    const dto = presentKnowledge(knowledge);

    /* Assert */
    expect(dto.updatedAt).toBe("2026-01-02T03:04:05.000Z");
  });

  it("異常系: updatedAtが無い場合はundefinedのまま返す", () => {
    /* Arrange */
    const knowledge = Knowledge.fromSourceDocument({
      path: "b.md",
      sourceUrl: "https://github.com/example/wiki/blob/main/b.md",
      content: "---\ntitle: B\n---\n\n本文",
    });

    /* Act */
    const dto = presentKnowledge(knowledge);

    /* Assert */
    expect(dto.updatedAt).toBeUndefined();
  });
});
