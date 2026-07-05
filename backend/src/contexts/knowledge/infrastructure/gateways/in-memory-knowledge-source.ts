import type { FetchKnowledgeSourcePort } from "../../application/ports/fetch-knowledge-source-port.js";
import type { KnowledgeSourceDocument } from "../../domain/entities/knowledge.js";

/**
 * テストやローカル起動で使うインメモリのナレッジソース。
 */
export class InMemoryKnowledgeSource implements FetchKnowledgeSourcePort {
  /**
   * インメモリのナレッジソースを生成する。
   *
   * @param documents 返却するMarkdown文書一覧。
   */
  constructor(private readonly documents: KnowledgeSourceDocument[]) {}

  /**
   * 登録済みのMarkdown文書をすべて取得する。
   *
   * @returns Markdown文書一覧。
   */
  async fetchAll(): Promise<KnowledgeSourceDocument[]> {
    return this.documents.map((document) => ({
      ...document,
      updatedAt: document.updatedAt === undefined ? undefined : new Date(document.updatedAt)
    }));
  }
}

/**
 * GitHub設定がないローカル環境で使うサンプル記事を生成する。
 *
 * @returns サンプルMarkdown文書一覧。
 */
export function createSampleKnowledgeSource(): InMemoryKnowledgeSource {
  return new InMemoryKnowledgeSource([
    {
      path: "Clean Architecture/Controller.md",
      sourceUrl: "https://github.com/example/knowledge/blob/main/Clean%20Architecture/Controller.md",
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      content: `---
id: clean-architecture-controller
title: Controllerの責務
category: Clean Architecture
tags:
  - clean-architecture
  - controller
order: 10
---

# Controllerの責務

ControllerはHTTP入力をUseCaseへ渡し、結果をHTTPレスポンスへ変換します。`
    },
    {
      path: "Clean Architecture/UseCase.md",
      sourceUrl: "https://github.com/example/knowledge/blob/main/Clean%20Architecture/UseCase.md",
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      content: `---
id: clean-architecture-usecase
title: UseCaseの責務
category: Clean Architecture
tags:
  - clean-architecture
  - usecase
order: 20
---

# UseCaseの責務

UseCaseはアプリケーション固有の処理手順を表します。`
    }
  ]);
}

