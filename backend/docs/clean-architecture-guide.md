# クリーンアーキテクチャ説明ガイド

このアプリは、GitHubで管理するMarkdown記事をAzure DevOps Wiki風に閲覧する「ナレッジ」コンテキストで層を分けている。

```txt
src/
  contexts/
    knowledge/
      domain/
      application/
        ports/
        use-cases/
      interface-adapters/
      infrastructure/
  shared/
```

依存の向きは、外側から内側へ向ける。

```txt
infrastructure -> application -> domain
interface-adapters -> application -> domain
```

内側の層は外側の層を知らない。Domain層はExpressやGitHub APIを知らない。

## Domain層

場所:

- `src/contexts/knowledge/domain/entities/knowledge.ts`
- `src/contexts/knowledge/domain/errors/domain-error.ts`

役割:

- GitHub Markdownから作られるナレッジ記事Entityを定義する
- frontmatterや本文から得た値を正規化する
- 記事として必要な不変条件を守る

してよいこと:

- タイトルが空ではないことを保証する
- タイトルの最大文字数を守る
- タグを小文字に正規化する
- frontmatterがない場合にファイルパスや見出しから値を補完する
- ドメイン専用のエラーを投げる

してはいけないこと:

- Expressの`Request`や`Response`を受け取る
- GitHub APIを直接呼ぶ
- HTTPステータスコードを決める
- 環境変数を読む

## Application層

場所:

- `src/contexts/knowledge/application/use-cases/`
- `src/contexts/knowledge/application/ports/fetch-knowledge-source-port.ts`
- `src/contexts/knowledge/application/errors/not-found-error.ts`

役割:

- ユースケースを表現する
- Domain Entityを使ってアプリケーション固有の処理を進める
- GitHubなど外部ソース取得のPortに依存する

主なUseCase:

- `listKnowledge`: 記事一覧を取得する
- `getKnowledge`: IDで記事を1件取得する
- `searchKnowledge`: キーワードとタグで記事を検索する
- `getKnowledgeTree`: Azure DevOps Wiki風の左サイドバーツリーを生成する
- `syncKnowledge`: 外部ソースへ疎通して取得件数を返す

してよいこと:

- ナレッジ記事を取得する
- ナレッジ記事を検索する
- Wikiツリーを組み立てる
- ナレッジが存在しない場合に`NotFoundError`を投げる
- `FetchKnowledgeSourcePort`を呼び出す

してはいけないこと:

- GitHub APIのURLを組み立てる
- Expressの`req`や`res`を受け取る
- OpenAPI validatorでHTTPリクエストを検証する
- JSONレスポンスの形を決める

## Gateway Port

場所:

- `src/contexts/knowledge/application/ports/fetch-knowledge-source-port.ts`
- `src/contexts/knowledge/application/ports/knowledge-api-ports.ts`

Gateway Portは、Application層が必要とする外部ソース取得の契約。

Portでしてよいこと:

- Markdown文書一覧を取得する契約を定義する
- Domain層に近いプレーンな型を返す

Portでしてはいけないこと:

- GitHub SDKやHTTP clientの型を公開する
- GitHub APIのレスポンス形式をそのままApplication層へ漏らす
- Expressの型を受け取る

実装:

- `GitHubKnowledgeSource`: GitHub Contents API用の本番実装
- `InMemoryKnowledgeSource`: 単体テスト・ローカルサンプル用の実装

`knowledge-api-ports.ts` はHTTP API全体を組み立てるためのPort集合型。UseCase単体は必要なPortだけに依存する。

## Interface Adapters層

場所:

- `src/contexts/knowledge/interface-adapters/http/controllers/`
- `src/contexts/knowledge/interface-adapters/http/presenters/`
- `src/contexts/knowledge/interface-adapters/http/routes.ts`
- `src/shared/http/openapi-validator.ts`
- `openapi/src/`
- `openapi/openapi.yaml`

役割:

- 外部入力をApplication層が扱える形に変換する
- Application層の結果をHTTPレスポンス用DTOに変換する
- HTTPの都合を吸収する

Controllerでしてよいこと:

- OpenAPI validatorで検証済みの入力をUseCaseへ渡す
- UseCaseを呼ぶ
- PresenterでレスポンスDTOへ変換する
- `next(error)`でエラーハンドラへ渡す

routesでしてよいこと:

- URLとHTTP methodを定義する
- どのController handlerを呼ぶか宣言する

OpenAPI validatorでしてよいこと:

- bundle済みの `openapi/openapi.yaml` を読み込む
- `req.body`、`req.params`、`req.query`をOpenAPI定義で検証する
- HTTP契約に違反したリクエストをControllerへ入れる前に止める

Controllerでしてはいけないこと:

- GitHub APIを直接呼ぶ
- Entityの業務ルールをここに書く
- タイトルの文字数などのドメインルールを決める
- 独自schemaを直接parseする
- 複数のユースケースにまたがる複雑な業務判断を抱える

## Infrastructure層

場所:

- `src/contexts/knowledge/infrastructure/gateways/`

役割:

- 技術詳細を実装する
- GitHub Contents APIを呼ぶ
- Application層のPortを満たす

してよいこと:

- GitHub APIのURLやheaderを組み立てる
- GitHub APIレスポンスをアプリ内の素朴な型へ変換する

してはいけないこと:

- HTTPレスポンスを返す
- Expressの`Request`や`Response`を扱う
- ユースケースそのものを決める
- Domain層を飛ばしてビジネスルールを実装する

## Composition Root

場所:

- `src/main.ts`
- `src/app.ts`

役割:

- 依存関係を組み立てる
- 本番用Gateway実装を注入する
- Expressアプリを起動する

このアプリでは、`main.ts`で環境変数から`GitHubKnowledgeSource`または`InMemoryKnowledgeSource`を作り、`createApp`へ渡している。

## Dockerの位置づけ

Docker Composeはバックエンドを同じ手順で起動するために使う。

Dockerでしてよいこと:

- ローカル開発環境を揃える
- GitHub設定を環境変数で渡す

Dockerでしないこと:

- Domain層やApplication層の設計に影響を与える
- 単体テストを本物のGitHub前提にする

## クリーンアーキテクチャでありがちなNG

- ControllerからGitHub APIを直接呼ぶ
- UseCaseが`Request`や`Response`を受け取る
- Domain EntityがGitHub APIレスポンスに依存する
- Gateway Portではなく具体実装に依存する
- 入力検証、業務ルール、外部API呼び出し、レスポンス整形を1つの関数に詰め込む
- 便利だからという理由で内側の層から外側の層をimportする
- 単体テストで毎回本物のGitHubが必要になる

## テスト配置

単体テストは対象コードの近くに置く。

例:

- `src/contexts/knowledge/domain/entities/knowledge.test.ts`
- `src/contexts/knowledge/application/use-cases/list-knowledge.test.ts`
- `src/contexts/knowledge/application/use-cases/get-knowledge.test.ts`
- `src/contexts/knowledge/application/use-cases/search-knowledge.test.ts`
- `src/contexts/knowledge/application/use-cases/get-knowledge-tree.test.ts`
- `src/contexts/knowledge/application/use-cases/sync-knowledge.test.ts`
- `src/contexts/knowledge/interface-adapters/http/knowledge-api.integration.test.ts`

この配置にすると、「このコードの責務はこのテストで確認している」と説明しやすい。

テスト名は、意図が読めるように `正常系`、`異常系`、`境界値` を明示する。
