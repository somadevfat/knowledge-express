<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# プロジェクトルール

このリポジトリで作業する際に必ず守るルール。詳細な背景・使い方は[README.md](README.md)・[docs/frontend-requirements.md](docs/frontend-requirements.md)を参照。

## アーキテクチャ

- Next.js単体で完結させる。別プロセスのバックエンドは持たない（かつて`backend/`にExpress + Clean Architectureの実装があったが、運用コストに見合わないため意図的に削除した。同じ理由で復活させない。Clean Architectureのデモが必要な場合は別プロジェクトで示す）
- `src/features/knowledge/server/**`は内部実装。他の場所（`app/`配下など）から使うときは必ず`src/features/knowledge/api/knowledge-api.ts`経由にする（ESLintの`no-restricted-imports`で強制）
- GitHubが正本。記事本文だけでなく、サイトのブランディング（タイトル・サブタイトル・ロゴ文字列）も参照先リポジトリ直下の`site.md`から読む。コードやenv varにハードコードしない
- `GITHUB_TOKEN`などのシークレットを扱うモジュールには`import "server-only"`を付け、クライアントバンドルへの混入を静的に防ぐ

## TypeScript / Lint

- `any`は使わない（`@typescript-eslint/no-explicit-any: error`）
- すべての関数宣言・クラス・クラスメソッドにJSDocを書く（`jsdoc/require-jsdoc: error`、exportの有無を問わない。`__tests__/`配下は対象外）
- 関数の引数は実際に使う分だけの型に絞る（例: `NodeJS.ProcessEnv`をそのまま受けず、読むキーだけを持つ専用型を定義する）。過剰に広い型はテストしにくくなる

## テスト

- Vitestでユニットテストのみ書く。E2Eは導入しない（vinext環境でのセットアップが煩雑なため）
- テストは対象コードと同じディレクトリの`__tests__/*.test.ts`に置く
- 各関数につき、正常系・異常系を最低1ケースずつ書く
- テスト本体は`/* Arrange */` → `/* Act */` → `/* Assert */`の3コメントで区切る（AAAパターン）。準備・実行・検証の境目を必ず明示する
- `page.tsx`などasync Server Componentsはユニットテスト対象外。手動またはビルドで動作確認する
- 実際のネットワークへは飛ばさない。`fetch`を使う処理は`vi.stubGlobal("fetch", ...)`でモックする
- `vite.config.ts`（vinext/Cloudflare用）と`vitest.config.ts`は完全に分離する。vitestがvinextのプラグインを読み込まないようにするため

## コミット

- Conventional Commits形式を守る（commitlintで強制、`type(scope): summary`）。scopeは`app`/`docs`/`deps`/`repo`
- 差分が大きくても、論理的に分けられるものは複数コミットに分割する
- hook（commitlint/husky）を`--no-verify`等でスキップしない

## コンテンツ連携（GitHub）

- 記事本文の取得・frontmatter解析は`features/knowledge/server/`に閉じる
- コード埋め込みは`` ```embed:<GitHubパーマリンク>``` ``形式。**ブランチ名ではなく必ずコミットSHA固定のパーマリンク**を使う（GitHub上で該当行を選択し`y`キー）。ブランチ参照だと後からファイルが編集されて行がズレ、解説と食い違ったコードが気付かず表示され続ける
- GitHub取得（記事・site.md・コード埋め込み）の失敗はページ全体を落とさず、その場にエラー内容を表示する

## データ永続化（Cloudflare D1）

- 記事のような「GitHubが正本」のデータではなく、サイトのアクセス数のようにアプリ側で状態を持つ必要があるものだけD1を使う
- D1へのアクセスは生SQLではなく[Drizzle ORM](https://orm.drizzle.team/)（`drizzle-orm/d1`）経由で行う。スキーマは`src/features/knowledge/server/db/schema.ts`
- D1バインディングが取得できないランタイム（`vinext dev`/Cloudflare Workers以外）では、機能を静かに無効化する（例外を投げてページを落とさない）
- スキーマ変更は`drizzle-kit generate`でマイグレーションSQLを`migrations/`に生成し、`wrangler d1 migrations apply <db> --local`と`--remote`の両方を必ず適用する

