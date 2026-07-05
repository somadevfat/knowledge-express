# OpenAPI定義

このディレクトリでは、API仕様を分割して管理します。

## 編集する場所

- `src/openapi.yaml`: OpenAPI全体の入口。pathとcomponentの参照だけを書く
- `src/paths/`: エンドポイント単位の定義を書く
- `src/components/schemas/`: request / responseで使うschemaを書く
- `src/components/responses/`: 共通エラーレスポンスを書く

## 生成物

- `openapi.yaml`: `src/` 配下をbundleした生成物

アプリケーションのOpenAPI validatorは、このbundle済み `openapi.yaml` を読み込みます。

## コマンド

```bash
npm run openapi:bundle
npm run openapi:lint
```

`npm run build` でもbundleは自動実行されます。
