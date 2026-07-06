# Knowledge Wiki Frontend

GitHubで管理しているMarkdown記事を、Azure DevOps Wiki風に閲覧するNext.jsアプリです。詳細な要件は [docs/frontend-requirements.md](../docs/frontend-requirements.md) を参照してください。

## セットアップ

```bash
npm install
cp .env.example .env.local
```

## 開発サーバーの起動

バックエンド (`backend/`) がポート3000でAPIを提供する前提のため、frontendの開発サーバーはポート3001で起動します。

```bash
npm run dev
```

[http://localhost:3001](http://localhost:3001) を開いてください。

バックエンドも別ターミナルで起動しておく必要があります（`backend/`ディレクトリで `npm run dev`）。バックエンドを起動せずにfrontendのみ起動すると、APIエラー画面が表示されます。

## 環境変数

`.env.example` を参照してください。`BACKEND_API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL` はどちらもバックエンドAPIのURL（既定値 `http://localhost:3000`）です。

## backendとの型共有

`src/features/knowledge/types/knowledge.ts` の`Knowledge`/`KnowledgeTreeNode`は、`backend/openapi/openapi.yaml`（backendが`npm run openapi:bundle`で生成するOpenAPI仕様）から[openapi-typescript](https://openapi-ts.dev/)で自動生成した`src/shared/api/schema.gen.ts`を参照しています。

- `npm run dev` / `npm run build` の前に自動実行される（`predev` / `prebuild`）ので、手動生成は基本不要です
- 手動で再生成したい場合は `npm run types:generate`
- `schema.gen.ts` はコミットしません（`.gitignore`済み）。backend側でAPIの形が変わったら、backendで`npm run openapi:bundle`を実行し、frontendの`.env.example`と同じディレクトリ構成（`../backend/openapi/openapi.yaml`）を保った状態でfrontendの型生成コマンドを流してください

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
