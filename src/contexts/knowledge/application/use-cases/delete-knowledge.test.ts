import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors/not-found-error.js";
import { InMemoryKnowledgeRepository } from "../../infrastructure/repositories/in-memory-knowledge-repository.js";
import { createKnowledge } from "./create-knowledge.js";
import { deleteKnowledge } from "./delete-knowledge.js";
import { getKnowledge } from "./get-knowledge.js";

describe("deleteKnowledge", () => {
  it("正常系: ナレッジ記事を削除する", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const created = await createKnowledge(repository, {
      title: "Delete target",
      body: "削除対象"
    });

    await deleteKnowledge(repository, created.toProps().id);

    await expect(getKnowledge(repository, created.toProps().id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("異常系: 存在しないIDならNotFoundErrorにする", async () => {
    const repository = new InMemoryKnowledgeRepository();

    await expect(deleteKnowledge(repository, "missing-id")).rejects.toBeInstanceOf(NotFoundError);
  });
});
