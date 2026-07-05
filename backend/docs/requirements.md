# MVP 要件定義

## 目的

GitHubで管理しているMarkdown記事を読み込み、Azure DevOps Wikiのように閲覧・検索できるナレッジAPIを作る。

クリーンアーキテクチャ学習用として、外部サービス連携、UseCase、Domain、Gatewayの責務分離を説明しやすい構成にする。

## スコープ

- 認証・認可は実装しない
- ナレッジ記事の正本はGitHubリポジトリ上のMarkdownファイルとする
- バックエンドはGitHubからMarkdownを取得する
- バックエンドはfrontmatterと本文を解析し、FEが扱いやすいJSONに整形する
- Azure DevOps Wikiのように、階層ツリー、記事詳細、検索に必要なAPIを提供する
- タグ検索とキーワード検索を提供する
- MVPではバックエンドAPIからの記事作成・編集・削除は行わない
- HTTP APIはExpressで提供する
- HTTP入力値検証はOpenAPI定義で行う
- GitHub連携はGateway Portとして抽象化し、UseCaseはGitHub SDKやHTTP clientに直接依存しない
- ユースケースはGitHubなしでテストできる
- JSDocで引数と戻り値を説明する

## ナレッジ記事

- `id`: 記事ID。Markdownのfrontmatter、またはファイルパスから生成する
- `title`: タイトル
- `body`: Markdown本文
- `excerpt`: 一覧表示用の短い抜粋
- `tags`: タグ一覧
- `category`: 表示カテゴリ
- `path`: GitHubリポジトリ内のファイルパス
- `order`: 同一階層内の表示順
- `sourceUrl`: GitHub上の記事URL
- `updatedAt`: GitHub上の最終更新日時。取得できない場合は省略可能

Markdownのfrontmatter例:

```md
---
id: clean-architecture-controller
title: Controllerの責務
category: Clean Architecture
tags:
  - clean-architecture
  - controller
order: 10
---

# Controllerの責務

ControllerはHTTP入力をUseCaseに渡す層です。
```

## Wikiツリー

- Azure DevOps Wikiのように左サイドバーへ表示できる階層構造を返す
- 階層はMarkdownのファイルパス、またはfrontmatterのcategoryから作る
- 各ノードは記事ID、タイトル、子ノード、表示順を持つ

## 主なAPI

- `GET /health`
- `GET /knowledge/tree`
- `GET /knowledge`
- `GET /knowledge/:id`
- `GET /knowledge/search?q=&tag=`
- `POST /knowledge/sync`

`POST /knowledge/sync` はGitHubから記事を再取得できることを確認する用途。MVPでは手動実行でよい。

## 非機能要件

- 各層の責務を守る
- 単一責務を意識する
- Application層はExpressやGitHub API clientに依存しない
- Domain層は外部ライブラリにできるだけ依存しない
- GitHub連携はGateway Portと実装を分ける
- エラー形式を統一する
- 単体テストは対象コードの近くに配置する
- 学習用に、機能コンテキストごとにディレクトリを分ける
- API仕様は `openapi/src/` を編集元、`openapi/openapi.yaml` をbundle済み生成物とする

## MVPでやらないこと

- ブラウザ上での記事編集
- GitHubへのcommit、pull request作成
- 認証
- コメント
- お気に入り
- 閲覧履歴
- 全文検索エンジンの導入
