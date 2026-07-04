/**
 * 要求されたアプリケーションリソースが存在しない場合のエラー。
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
