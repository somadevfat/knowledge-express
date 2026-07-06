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
