# MVP 要件定義

## 目的

クリーンアーキテクチャを学ぶLT用に、責務分離とテスタブル設計を説明しやすいナレッジ管理APIを作る。

## スコープ

- 認証・認可は実装しない
- ナレッジ記事のCRUDを提供する
- タグ検索とキーワード検索を提供する
- DBはPostgreSQLを使う
- PostgreSQLはDocker Composeで起動できる
- DBアクセスはDrizzle ORMを使う
- HTTP APIはExpressで提供する
- 入力値検証はZodで行う
- ユースケースはDBなしでテストできる
- JSDocで引数と戻り値を説明する

## ナレッジ記事

- `id`: UUID
- `title`: タイトル
- `body`: 本文
- `tags`: タグ一覧
- `createdAt`: 作成日時
- `updatedAt`: 更新日時

## 主なAPI

- `GET /health`
- `GET /knowledge`
- `GET /knowledge/:id`
- `POST /knowledge`
- `PUT /knowledge/:id`
- `DELETE /knowledge/:id`

## 非機能要件

- 各層の責務を守る
- 単一責務を意識する
- Application層はExpressやDrizzleに依存しない
- Domain層は外部ライブラリにできるだけ依存しない
- Repository Portと実装を分ける
- エラー形式を統一する
- 単体テストは対象コードの近くに配置する
- 学習用に、機能コンテキストごとにディレクトリを分ける
