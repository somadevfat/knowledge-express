# Clean Architecture Knowledge API

LTでクリーンアーキテクチャを説明するための、ナレッジ管理APIのMVPです。

## 技術スタック

- Express
- TypeScript
- Zod
- Drizzle ORM
- PostgreSQL
- Vitest

## セットアップ

```bash
npm install
cp .env.example .env
docker compose up -d db
npm run db:push
npm run dev
```

## テスト

```bash
npm test
```

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
- `GET /knowledge?q=&tag=`
- `GET /knowledge/:id`
- `POST /knowledge`
- `PUT /knowledge/:id`
- `DELETE /knowledge/:id`

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

PostgreSQLはDocker Composeで起動します。

```bash
docker compose up -d db
docker compose down
```

ホスト側のポートは、ローカルPostgreSQLと衝突しにくいように `5433` を使っています。

DBのデータを消したい場合:

```bash
docker compose down -v
```
