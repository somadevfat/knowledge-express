import { randomUUID } from "node:crypto";
import { DomainError } from "../errors/domain-error.js";

export type KnowledgeId = string;

export type KnowledgeProps = {
  id: KnowledgeId;
  title: string;
  body: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type CreateKnowledgeParams = {
  title: string;
  body: string;
  tags?: string[];
};

export type UpdateKnowledgeParams = {
  title?: string;
  body?: string;
  tags?: string[];
};

/**
 * ナレッジ記事を表すDomain Entity。
 *
 * タイトルと本文の必須チェック、タグの正規化など、業務ルールをこのクラスに閉じ込める。
 */
export class Knowledge {
  private constructor(private readonly props: KnowledgeProps) {}

  /**
   * 新しいナレッジ記事を作成する。
   *
   * @param params Application層から渡される作成値。
   * @returns 作成されたナレッジEntity。
   * @throws {DomainError} ドメインルールに違反した場合。
   */
  static create(params: CreateKnowledgeParams): Knowledge {
    const now = new Date();

    return new Knowledge({
      id: randomUUID(),
      title: Knowledge.validateTitle(params.title),
      body: Knowledge.validateBody(params.body),
      tags: Knowledge.normalizeTags(params.tags ?? []),
      createdAt: now,
      updatedAt: now
    });
  }

  /**
   * 永続化済みデータからEntityを復元する。
   *
   * @param props DBなどから取得した永続化済みの値。
   * @returns 復元されたナレッジEntity。
   * @throws {DomainError} 永続化済みデータがドメインルールに違反している場合。
   */
  static reconstruct(props: KnowledgeProps): Knowledge {
    return new Knowledge({
      id: props.id,
      title: Knowledge.validateTitle(props.title),
      body: Knowledge.validateBody(props.body),
      tags: Knowledge.normalizeTags(props.tags),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt
    });
  }

  /**
   * ナレッジ記事の値を更新する。
   *
   * @param params 更新対象の値。
   * @returns 更新後のナレッジEntity。
   * @throws {DomainError} ドメインルールに違反した場合。
   */
  update(params: UpdateKnowledgeParams): Knowledge {
    return new Knowledge({
      ...this.props,
      title: params.title === undefined ? this.props.title : Knowledge.validateTitle(params.title),
      body: params.body === undefined ? this.props.body : Knowledge.validateBody(params.body),
      tags: params.tags === undefined ? this.props.tags : Knowledge.normalizeTags(params.tags),
      updatedAt: new Date()
    });
  }

  /**
   * Entityをプレーンな値へ変換する。
   *
   * @returns 外部から直接変更されないようにコピーしたEntityの値。
   */
  toProps(): KnowledgeProps {
    return {
      ...this.props,
      tags: [...this.props.tags],
      createdAt: new Date(this.props.createdAt),
      updatedAt: new Date(this.props.updatedAt)
    };
  }

  private static validateTitle(title: string): string {
    const trimmed = title.trim();
    if (trimmed.length < 1) {
      throw new DomainError("Title is required.");
    }
    if (trimmed.length > 120) {
      throw new DomainError("Title must be 120 characters or less.");
    }
    return trimmed;
  }

  private static validateBody(body: string): string {
    const trimmed = body.trim();
    if (trimmed.length < 1) {
      throw new DomainError("Body is required.");
    }
    return trimmed;
  }

  private static normalizeTags(tags: string[]): string[] {
    return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
  }
}
