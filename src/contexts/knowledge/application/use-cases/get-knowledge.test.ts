import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors/not-found-error.js";
import { InMemoryKnowledgeRepository } from "../../infrastructure/repositories/in-memory-knowledge-repository.js";
import { createKnowledge } from "./create-knowledge.js";
import { getKnowledge } from "./get-knowledge.js";

describe("getKnowledge", () => {
  it("正常系: IDに一致するナレッジ記事を取得する", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const created = await createKnowledge(repository, {
      title: "Use Case",
      body: "Application固有の処理を書く。"
    });

    const found = await getKnowledge(repository, created.toProps().id);

    expect(found.toProps()).toMatchObject({
      id: created.toProps().id,
      title: "Use Case",
      body: "Application固有の処理を書く。"
    });
  });

  it("異常系: 存在しないIDならNotFoundErrorにする", async () => {
    const repository = new InMemoryKnowledgeRepository();

    await expect(getKnowledge(repository, "missing-id")).rejects.toBeInstanceOf(NotFoundError);
  });
});
