# クリーンアーキテクチャ説明ガイド

このアプリは、LTで説明しやすいように「ナレッジ」という機能コンテキストの中で層を分けている。

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

内側の層は外側の層を知らない。Domain層はExpress、Drizzle、PostgreSQLを知らない。

## Domain層

場所:

- `src/contexts/knowledge/domain/entities/knowledge.ts`
- `src/contexts/knowledge/domain/errors/domain-error.ts`

役割:

- 業務ルールを表現する
- Entityを定義する
- 値の正規化や不変条件を守る

してよいこと:

- タイトルが空ではないことを保証する
- タグを小文字に正規化する
- Entityの状態変更ルールを書く
- ドメイン専用のエラーを投げる

してはいけないこと:

- Expressの`Request`や`Response`を受け取る
- DrizzleやPostgreSQLを直接使う
- HTTPステータスコードを決める
- 環境変数を読む

## Application層

場所:

- `src/contexts/knowledge/application/use-cases/`
- `src/contexts/knowledge/application/ports/save-knowledge-port.ts`
- `src/contexts/knowledge/application/ports/find-knowledge-by-id-port.ts`
- `src/contexts/knowledge/application/ports/search-knowledge-port.ts`
- `src/contexts/knowledge/application/ports/delete-knowledge-port.ts`
- `src/contexts/knowledge/application/errors/not-found-error.ts`

役割:

- ユースケースを表現する
- Domain Entityを使ってアプリケーション固有の処理を進める
- Repository Portに依存する

してよいこと:

- ナレッジを作成する
- ナレッジを検索する
- ナレッジが存在しない場合に`NotFoundError`を投げる
- Repository Portを呼び出す

してはいけないこと:

- SQLを書く
- Drizzleのクエリを書く
- Expressの`req`や`res`を受け取る
- ZodでHTTPリクエストを検証する
- JSONレスポンスの形を決める

## Repository Port

場所:

- `src/contexts/knowledge/application/ports/save-knowledge-port.ts`
- `src/contexts/knowledge/application/ports/find-knowledge-by-id-port.ts`
- `src/contexts/knowledge/application/ports/search-knowledge-port.ts`
- `src/contexts/knowledge/application/ports/delete-knowledge-port.ts`
- `src/contexts/knowledge/application/ports/knowledge-api-ports.ts`

Repository Portは、Application層が必要とする永続化操作の契約。
学習用に、1つの巨大なPortではなく操作ごとに分割している。

Portでしてよいこと:

- `save`
- `findById`
- `search`
- `deleteById`
- Domain Entityを引数や戻り値にする

Port分割の狙い:

- `createKnowledge` は `SaveKnowledgePort` だけに依存する
- `getKnowledge` は `FindKnowledgeByIdPort` だけに依存する
- `updateKnowledge` は `FindKnowledgeByIdPort` と `SaveKnowledgePort` だけに依存する
- `deleteKnowledge` は `DeleteKnowledgePort` だけに依存する
- `searchKnowledge` は `SearchKnowledgePort` だけに依存する

Portでしてはいけないこと:

- Drizzleの型を公開する
- SQLやPostgreSQL固有の都合を混ぜる
- Expressの型を受け取る

実装:

- `DrizzleKnowledgeRepository`: PostgreSQL用の本番実装
- `InMemoryKnowledgeRepository`: 単体テスト用の実装

Drizzle側のRepositoryは、学習用にDB操作も操作別ファイルへ分けている。

- `save-knowledge.ts`
- `find-knowledge-by-id.ts`
- `search-knowledge.ts`
- `delete-knowledge-by-id.ts`
- `knowledge-row-mapper.ts`

`knowledge-api-ports.ts` はHTTP API全体を組み立てるためのPort集合型。UseCase単体はこの集合型に依存しない。

## Interface Adapters層

場所:

- `src/contexts/knowledge/interface-adapters/http/controllers/`
- `src/contexts/knowledge/interface-adapters/http/schemas/`
- `src/contexts/knowledge/interface-adapters/http/presenters/`
- `src/contexts/knowledge/interface-adapters/http/routes.ts`

役割:

- 外部入力をApplication層が扱える形に変換する
- Application層の結果をHTTPレスポンス用DTOに変換する
- HTTPの都合を吸収する

Controllerでしてよいこと:

- `req.body`や`req.query`を読む
- Zodで入力値を検証する
- Use Caseを呼ぶ
- PresenterでレスポンスDTOへ変換する
- `next(error)`でエラーハンドラへ渡す

Controllerでしてはいけないこと:

- DBへ直接アクセスする
- SQLやDrizzleクエリを書く
- Entityの業務ルールをここに書く
- タイトルの文字数などのドメインルールを決める
- 複数のユースケースにまたがる複雑な業務判断を抱える

## Infrastructure層

場所:

- `src/contexts/knowledge/infrastructure/database/`
- `src/contexts/knowledge/infrastructure/repositories/`

役割:

- 技術詳細を実装する
- PostgreSQLやDrizzleを使う
- Application層のRepository Portを満たす

してよいこと:

- Drizzleのschemaを書く
- SQLに相当するクエリを書く
- DB rowとDomain Entityを変換する
- PostgreSQL接続を作る

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
- 本番用Repository実装を注入する
- Expressアプリを起動する

このアプリでは、`main.ts`で`DrizzleKnowledgeRepository`を作り、`createApp`へ渡している。

## Dockerの位置づけ

Docker ComposeはPostgreSQLを起動するためだけに使う。

Dockerでしてよいこと:

- ローカル開発用DBを用意する
- DB名、ユーザー、ポートを揃える
- LT参加者の環境差分を減らす

Dockerでしないこと:

- Domain層やApplication層の設計に影響を与える
- 単体テストを本物のDB前提にする

## クリーンアーキテクチャでありがちなNG

- ControllerからDBを直接呼ぶ
- Use Caseが`Request`や`Response`を受け取る
- Domain EntityがORMのSchemaに依存する
- Repository Portではなく具体実装に依存する
- 入力検証、業務ルール、DB保存、レスポンス整形を1つの関数に詰め込む
- 便利だからという理由で内側の層から外側の層をimportする
- 単体テストで毎回本物のDBが必要になる

## テスト配置

単体テストは対象コードの近くに置く。

例:

- `src/contexts/knowledge/domain/entities/knowledge.test.ts`
- `src/contexts/knowledge/application/use-cases/create-knowledge.test.ts`
- `src/contexts/knowledge/application/use-cases/get-knowledge.test.ts`
- `src/contexts/knowledge/application/use-cases/update-knowledge.test.ts`
- `src/contexts/knowledge/application/use-cases/delete-knowledge.test.ts`
- `src/contexts/knowledge/application/use-cases/search-knowledge.test.ts`
- `src/contexts/knowledge/interface-adapters/http/schemas/knowledge-schema.test.ts`

この配置にすると、「このコードの責務はこのテストで確認している」と説明しやすい。

テスト名は、意図が読めるように `正常系`、`異常系`、`境界値` を明示する。
