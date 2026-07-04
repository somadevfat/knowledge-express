# API仕様

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

レスポンス:

```json
{
  "status": "ok"
}
```

## GET /knowledge

ナレッジ記事一覧を取得する。

Query:

- `q`: タイトル・本文のキーワード検索
- `tag`: タグ検索

例:

```bash
curl "http://localhost:3000/knowledge?q=repository&tag=clean-architecture"
```

## GET /knowledge/:id

ナレッジ記事を1件取得する。

例:

```bash
curl "http://localhost:3000/knowledge/{id}"
```

## POST /knowledge

ナレッジ記事を作成する。

Request:

```json
{
  "title": "Repositoryの責務",
  "body": "Repositoryは永続化の詳細を隠す。",
  "tags": ["clean-architecture", "repository"]
}
```

例:

```bash
curl -X POST "http://localhost:3000/knowledge" \
  -H "Content-Type: application/json" \
  -d '{"title":"Repositoryの責務","body":"Repositoryは永続化の詳細を隠す。","tags":["clean-architecture","repository"]}'
```

## PUT /knowledge/:id

ナレッジ記事を更新する。

Request:

```json
{
  "title": "Use Caseの責務",
  "body": "Use Caseはアプリケーション固有の処理を書く。",
  "tags": ["clean-architecture", "use-case"]
}
```

## DELETE /knowledge/:id

ナレッジ記事を削除する。

例:

```bash
curl -X DELETE "http://localhost:3000/knowledge/{id}"
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
