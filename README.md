# SE WIKI

GitHubで管理しているMarkdown記事を、Azure DevOps Wiki風に閲覧・検索できるNext.jsアプリです。詳細な要件は[docs/frontend-requirements.md](docs/frontend-requirements.md)を参照してください。

Next.js単体で完結する構成です。GitHubリポジトリからのMarkdown取得・frontmatter解析・記事一覧構築まで、すべて`src/features/knowledge/server/`配下でNext.jsのサーバー側（Server Components）だけで行います。別プロセスのバックエンドはありません。

## セットアップ

```bash
npm install
cp .env.example .env.local
```

## 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3001](http://localhost:3001) を開いてください。

## 環境変数

`.env.example` を参照してください。取得先のGitHubリポジトリを指定します。

- `GITHUB_OWNER` / `GITHUB_REPOSITORY` / `GITHUB_BRANCH` / `GITHUB_KNOWLEDGE_PATH` — 記事Markdownが置かれているリポジトリとパス
- `GITHUB_TOKEN` — private repositoryを使う場合やAPI rate limit対策が必要な場合に設定。空でも公開リポジトリなら動作します

`GITHUB_OWNER`/`GITHUB_REPOSITORY`が未設定の場合は、ローカル確認用のサンプル記事にフォールバックします（`src/features/knowledge/server/knowledge-source.ts`）。

`GITHUB_TOKEN`は`src/features/knowledge/api/knowledge-api.ts`の先頭で`import "server-only"`しているモジュール経由でのみ読まれるため、クライアントバンドルに含まれません。

## ブランディング設定（サイトタイトル・サブタイトル・ロゴ文字列）

サイトのタイトル・サブタイトル・ヘッダーのロゴ文字列は、コードを変更せずに**参照先GitHubリポジトリ直下の`site.md`**で上書きできます（`src/features/knowledge/server/site-config.ts`）。

```md
---
title: SE WIKI
subtitle: 実務で使える設計からデプロイまで、すべて解説する
logoText: SE WIKI
---
```

- `title` — `<title>`タグ・OGP用のサイト名
- `subtitle` — トップページの説明文・OGPのdescription
- `logoText` — ヘッダー左上のロゴ文字列（`title`と別の値にできる）

`site.md`が無い、または取得に失敗した場合はデフォルト値（`SE WIKI` / 実務で使える設計からデプロイまで、すべて解説する）にフォールバックします。**`GITHUB_REPOSITORY`を別のリポジトリに向けるだけで、コード変更なしにブランディングごと差し替えられます。**

## 記事へのコード埋め込み

記事のMarkdown本文に、GitHubの**パーマリンク**（コミットSHA固定のURL）を使って他リポジトリの実コードを埋め込めます（`src/shared/markdown/github-embed.ts`）。

````md
```embed:https://github.com/owner/repo/blob/<commit-sha>/path/to/file.ts#L10-L30
```
````

- GitHub上でファイルを開き、行を選択して`y`キーを押すとコミット固定のパーマリンクをコピーできます。それをそのまま貼るだけです
- ブランチ名ではなく**コミットSHAを使う**ことを推奨します。ブランチ参照だと、後から誰かがファイルを編集して行がずれた場合に、指定した行範囲が別のコードを指してしまい、解説と食い違った状態で気付かず表示され続けます
- 取得に失敗した場合（URLが不正、ファイルが存在しない等）は、ページを落とさずエラー内容をコードブロックとして表示します
- 埋め込まれたコードは`rehype-highlight`でシンタックスハイライトされます

## サイトアクセス数（Cloudflare D1）

全ページ共通のフッターに、サイト全体のアクセス数を表示します（`src/features/knowledge/server/view-count.ts` + [Drizzle ORM](https://orm.drizzle.team/)）。

- Cloudflare D1（`se-wiki-views`データベース、`site_views`テーブルに`id=1`の1行だけ持つ）にDrizzle経由でupsertします
- `wrangler.jsonc`の`d1_databases`で`VIEWS_DB`としてバインドし、`cloudflare:workers`の`env.VIEWS_DB`経由でアクセスします
- D1バインディングが無いランタイム（プレーンな`next dev`/`next build`、`vinext start`など、Cloudflare Workersランタイムをエミュレートしない環境）では、静かに機能を無効化します（フッター自体を表示しない）。**ローカルで実際に動作確認したい場合は`npm run dev:vinext`を使ってください**（Miniflare経由でD1をエミュレートします）
- スキーマは`src/features/knowledge/server/db/schema.ts`、マイグレーションSQLは`migrations/`に置きます

```bash
# スキーマ変更時
npx drizzle-kit generate
npx wrangler d1 migrations apply se-wiki-views --local   # ローカル(Miniflare)へ適用
npx wrangler d1 migrations apply se-wiki-views --remote  # 本番D1へ適用
```

## テスト

[Vitest](https://vitest.dev/)でユニットテストを書きます（E2Eは今のところ導入していません。vinext環境でのE2Eはセットアップが煩雑なため）。

```bash
npm run test        # 1回実行
npm run test:watch  # watchモード
```

- テストは`src/**/__tests__/*.test.ts`に置きます（テスト対象コードと同じディレクトリの`__tests__/`配下）
- 対象は主に`features/knowledge/server/`・`shared/markdown/`の純粋なロジック（GitHub取得・frontmatter解析・use-case・URLパースなど）。各関数につき正常系・異常系を最低1つずつ書きます
- `page.tsx`（async Server Components）はユニットテスト向きではないため対象外にしています。動作確認は手動またはビルドで行います
- `server-only`をimportしているモジュールは、`vitest.config.ts`で空モジュールへのエイリアスを設定しているため、Vitest上でも普通にimportできます
- `fetch`を呼ぶ処理（GitHub取得系）は`vi.stubGlobal("fetch", ...)`でモックし、実際のネットワークへは飛ばしません
- テストの本体（`it(...)`の中身）は必ず`/* Arrange */` → `/* Act */` → `/* Assert */`の3コメントで区切ります。準備・実行・検証の境目を毎回明示することで、後から読んだときに「何を検証しているテストか」が一目でわかるようにするためです

## Lintルール

- `@typescript-eslint/no-explicit-any`を`error`にして`any`を禁止しています
- `features/knowledge/server/**`は`features/knowledge/api/knowledge-api.ts`の内部実装という位置づけなので、それ以外の場所（`app/`配下など）から直接importすると`no-restricted-imports`でエラーになります。必ず`@/features/knowledge/api/knowledge-api`経由で使ってください
- `jsdoc/require-jsdoc`（[eslint-plugin-jsdoc](https://github.com/gajus/eslint-plugin-jsdoc)）で、すべての関数宣言・クラス・クラスメソッド（exportの有無を問わず）にJSDocコメントを必須にしています。`__tests__/`配下は対象外（テストの意図は`it(...)`の説明文で表す）

## その他のコマンド

```bash
npm run build
npm run lint
```

## Cloudflareへのデプロイ（vinext）

本番は[vinext](https://github.com/cloudflare/vinext)でCloudflare Workers上にデプロイします。vinextはNext.jsのAPIをVite上に再実装したツールで、Next.js本体のツールチェーンは変更していません（`npm run dev`/`npm run build`は今まで通りNext.jsのまま動きます）。

```bash
npm run dev:vinext    # vinextの開発サーバー (port 3001)
npm run build:vinext  # 本番ビルド
npm run start:vinext  # ビルド成果物をローカルで起動して確認
```

Cloudflareへの初回デプロイ前に必要な準備:

1. `wrangler login` でCloudflareアカウントに認証する（CIでは`CLOUDFLARE_API_TOKEN`環境変数でも可）
2. `wrangler.jsonc`の`account_id`を設定するか、`CLOUDFLARE_ACCOUNT_ID`環境変数を設定する
3. データキャッシュにCloudflare KVを使う設定になっているため、KV namespaceを作成し、`wrangler.jsonc`の`kv_namespaces[0].id`を実際のnamespace IDに置き換える

```bash
npx wrangler kv namespace create VINEXT_KV_CACHE
```

準備ができたらデプロイします。

```bash
npm run deploy:vinext
```

画像最適化はCloudflare Imagesを使う設定になっていますが、現状`next/image`は未使用のため実質未使用です（`next/font/google`はビルド時セルフホストではなくCDNから読み込まれる点のみ、vinextの既知の制限として残っています）。

## コミットメッセージ

[commitlint](https://commitlint.js.org/)でConventional Commits形式を強制しています（Huskyの`commit-msg`フックで自動チェック）。

## ドキュメント

- [フロントエンドMVP要件定義](docs/frontend-requirements.md)

## ライセンス

[MIT](LICENSE)
