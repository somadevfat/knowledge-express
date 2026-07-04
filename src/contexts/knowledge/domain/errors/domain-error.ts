/**
 * ドメインルール違反を表すエラー。
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
