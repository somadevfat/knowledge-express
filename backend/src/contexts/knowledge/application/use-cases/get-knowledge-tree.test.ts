import { describe, expect, it } from "vitest";
import { InMemoryKnowledgeSource } from "../../infrastructure/gateways/in-memory-knowledge-source.js";
import { getKnowledgeTree } from "./get-knowledge-tree.js";

describe("getKnowledgeTree", () => {
  it("正常系: カテゴリからWikiツリーを生成する", async () => {
    const source = new InMemoryKnowledgeSource([
      {
        path: "Clean Architecture/Controller.md",
        sourceUrl: "https://github.com/example/wiki/blob/main/Controller.md",
        content: "---\nid: controller\ntitle: Controller\ncategory: Clean Architecture\n---\n\n本文"
      }
    ]);

    const tree = await getKnowledgeTree(source);

    expect(tree).toEqual([
      {
        id: "category:Clean Architecture",
        title: "Clean Architecture",
        path: "Clean Architecture",
        children: [
          {
            id: "controller",
            title: "Controller",
            path: "Clean Architecture/Controller.md",
            children: []
          }
        ]
      }
    ]);
  });
});

