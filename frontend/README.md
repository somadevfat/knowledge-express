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
