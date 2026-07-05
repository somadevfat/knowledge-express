import { describe, expect, it } from "vitest";
import { InMemoryKnowledgeSource } from "../../infrastructure/gateways/in-memory-knowledge-source.js";
import { NotFoundError } from "../errors/not-found-error.js";
import { getKnowledge } from "./get-knowledge.js";

describe("getKnowledge", () => {
  it("正常系: IDに一致するナレッジ記事を取得する", async () => {
    const source = new InMemoryKnowledgeSource([
      {
        path: "UseCase.md",
        sourceUrl: "https://github.com/example/wiki/blob/main/UseCase.md",
        content: "---\nid: usecase\n title: UseCase\n---\n\nUseCase本文"
      }
    ]);

    const result = await getKnowledge(source, "usecase");

    expect(result.toProps()).toMatchObject({
      id: "usecase",
      title: "UseCase"
    });
  });

  it("異常系: 存在しないIDの場合はNotFoundErrorを投げる", async () => {
    const source = new InMemoryKnowledgeSource([]);

    await expect(getKnowledge(source, "missing-id")).rejects.toBeInstanceOf(NotFoundError);
  });
});

