/**
 * ドメインルール違反を表すエラー（例: 記事本文が空、タイトルが長すぎる等）。
 */
export class DomainError extends Error {
  /**
   * @param message 人間が読めるエラーメッセージ。
   */
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

/**
 * 要求されたナレッジ記事が存在しない場合のエラー。
 */
export class NotFoundError extends Error {
  /**
   * @param message 人間が読めるエラーメッセージ。
   */
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
