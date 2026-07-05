# API仕様

このAPIの正は、手書き説明ではなくOpenAPI定義です。

- 編集する定義: `openapi/src/`
- bundle済み定義: `openapi/openapi.yaml`

`openapi/openapi.yaml` は生成物です。APIを追加・変更するときは、原則として `openapi/src/paths/` や `openapi/src/components/` の分割ファイルを編集します。

```bash
npm run openapi:bundle
npm run openapi:lint
```

バックエンドは `express-openapi-validator` でこのOpenAPI定義を読み込み、HTTP requestの`body`、`params`、`query`を検証します。

## 共通レスポンス

成功時:

```json
{
  "data": {}
}
```

エラー時:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": {}
  }
}
```

## GET /health

ヘルスチェック。

```bash
curl "http://localhost:3000/health"
```

## GET /knowledge

GitHub由来のナレッジ記事一覧を取得する。

```bash
curl "http://localhost:3000/knowledge"
```

## GET /knowledge/search

キーワードとタグでナレッジ記事を検索する。

Query:

- `q`: タイトル・本文・抜粋・カテゴリのキーワード検索
- `tag`: タグ検索

```bash
curl "http://localhost:3000/knowledge/search?q=repository&tag=clean-architecture"
```

## GET /knowledge/tree

Azure DevOps Wiki風の左サイドバーで使う記事ツリーを取得する。

```bash
curl "http://localhost:3000/knowledge/tree"
```

## GET /knowledge/:id

ナレッジ記事を1件取得する。

```bash
curl "http://localhost:3000/knowledge/{id}"
```

## POST /knowledge/sync

GitHubからMarkdown記事を再取得する。

MVPでは永続キャッシュ更新はせず、外部ソースに疎通して取得件数を返す。

```bash
curl -X POST "http://localhost:3000/knowledge/sync"
```

## APIテスト

通常のAPI結合テストは、VitestとsupertestでExpressアプリをインプロセス起動して実行する。

```bash
npm run test:api
```

起動中のローカルサーバに対して疎通確認する場合:

```bash
npm run test:live
```
