# Clean Architecture Knowledge API

LTでクリーンアーキテクチャを説明するための、ナレッジ管理APIのMVPです。

今後はGitHubで管理するMarkdown記事を取得し、Azure DevOps Wikiのように閲覧・検索できるAPIへ寄せていきます。

## 技術スタック

- Express
- TypeScript
- OpenAPI
- express-openapi-validator
- Vitest

## セットアップ

リポジトリルートからDockerで起動する場合:

```bash
docker compose up --build
```

バックエンドだけローカルで起動する場合:

```bash
npm install
cp .env.example .env
npm run dev
```

GitHub設定を入れない場合は、ローカル確認用のサンプル記事を返します。

## テスト

```bash
npm test
```

OpenAPIを更新した場合:

```bash
npm run openapi:bundle
npm run openapi:lint
```

`npm run dev` / `npm run build` / `npm test` の前に自動実行される（`predev` / `prebuild` / `pretest`）ので、手動での再bundleは基本不要です。

## backendとの型共有

`openapi/src/components/schemas/*.yaml`（OpenAPI定義）が唯一の手書きソースです。ここから2つの型が自動生成されます。

- `src/shared/api/schema.gen.ts`（backend）— `presenters/knowledge-presenter.ts`の`KnowledgeResponse`はこの生成型を使っています
- `frontend/src/shared/api/schema.gen.ts`（frontend）— 同じOpenAPI定義から生成

Entity（`domain/entities/knowledge.ts`の`KnowledgeProps`）はドメイン内部の表現なので、意図的にAPI契約とは切り離しています。

さらに`express-openapi-validator`の`validateResponses: true`により、実際のレスポンスがOpenAPI定義と食い違うと`npm test`実行時にエラーで検知されます。presenterやEntityの形を変えたときは、`openapi/src/components/schemas/knowledge.yaml`など該当するyamlも一緒に更新してください。

API結合テストだけ実行する場合:

```bash
npm run test:api
```

起動中のローカルサーバに対して疎通確認する場合:

```bash
npm run test:live
```

## API

- `GET /health`
- `GET /knowledge/tree`
- `GET /knowledge`
- `GET /knowledge/:id`
- `GET /knowledge/search?q=&tag=`
- `POST /knowledge/sync`

## GitHub記事設定

`.env` でGitHub上のMarkdown配置先を指定します。

```env
GITHUB_OWNER=somadevfat
GITHUB_REPOSITORY=knowledge-wiki
GITHUB_BRANCH=main
GITHUB_KNOWLEDGE_PATH=docs
GITHUB_TOKEN=
```

public repositoryなら `GITHUB_TOKEN` は空でも動きます。private repositoryやrate limit対策が必要な場合はtokenを設定します。

## ドキュメント

- [要件定義](docs/requirements.md)
- [クリーンアーキテクチャ説明](docs/clean-architecture-guide.md)
- [API仕様](docs/api.md)

## ディレクトリ方針

学習用に、機能コンテキスト単位で少し細かく分けています。

```txt
src/contexts/knowledge/
  domain/
  application/
    ports/
    use-cases/
  interface-adapters/
  infrastructure/
```

単体テストは、対象コードの近くに `*.test.ts` として置いています。

## Docker

Docker Composeはリポジトリルートで実行します。

```bash
cd ..
docker compose up --build
docker compose down
```

GitHub上のMarkdownを正本にするため、MVPではDBでの記事管理は行いません。
