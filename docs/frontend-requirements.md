# フロントエンド MVP 要件定義

## 目的

GitHubで管理しているMarkdown記事を、Azure DevOps Wikiのように探して読めるナレッジ画面を作る。

バックエンドはGitHubから記事を取得して整形し、フロントエンドはWikiとして読みやすく表示する。

## 想定ユーザー

- 自分用の技術メモをGitHubで管理したい人
- Clean Architectureや設計メモをWiki形式で読みたい人
- ポートフォリオを見る採用担当者、エンジニア

## MVP スコープ

- 認証はMVPでは実装しない
- Azure DevOps Wiki風の3ペイン構成にする
- 左サイドバーに記事ツリーを表示する
- 中央にMarkdown記事本文を表示する
- 右サイドバーに見出し目次を表示する
- ナレッジ記事の一覧を表示する
- ナレッジ記事の詳細を表示する
- キーワード検索ができる
- タグ検索ができる
- GitHub上の元記事へ移動できる
- APIエラーを画面でわかるように表示する
- ローディング中の状態を表示する
- 空状態を表示する
- 記事詳細ページはSEOを意識したURLとmetadataを持つ

## 画面一覧

### Wiki閲覧画面

目的:

- GitHubで管理しているナレッジをWikiとして読む
- ツリーから記事を選ぶ
- 記事内の見出しへ移動する

表示するもの:

- 左サイドバーの記事ツリー
- 中央の記事本文
- 右サイドバーの見出し目次
- タイトル
- タグ
- 更新日時
- GitHubで開くリンク
- 検索入力

状態:

- 読み込み中
- 記事なし
- 対象記事なし
- APIエラー

### 検索結果画面

目的:

- キーワードやタグで記事を探す
- 検索結果から記事へ移動する

表示するもの:

- 検索入力
- タグ絞り込み
- 検索結果一覧
- タイトル
- 本文の短い抜粋
- タグ
- 更新日時

状態:

- 読み込み中
- 検索結果なし
- APIエラー

### 記事一覧画面

目的:

- 全記事をスキャンしやすく表示する
- タグやカテゴリから記事を選ぶ

## API連携

使用するAPI:

- `GET /health`
- `GET /knowledge/tree`
- `GET /knowledge`
- `GET /knowledge/:id`
- `GET /knowledge/search?q=&tag=`

API Base URL:

- 開発環境では `http://localhost:3000`
- 環境変数で差し替えられるようにする
- Next.jsのServer ComponentまたはRoute Handlerからbackend APIを呼べる構成にする
- GitHub tokenはbackendだけが保持し、frontendへは渡さない

## SEO要件

- 記事詳細ページは個別URLを持つ
- 記事ごとに`title`、`description`、Open Graph用metadataを設定する
- 一覧・検索・カテゴリ導線から記事詳細へ遷移できる
- Markdown本文の先頭見出しや抜粋をmetadata生成に使う
- MVPでは検索エンジン向けの最低限のmetadataまでを対象にする

## UI要件

- ポートフォリオとして見やすいこと
- Azure DevOps Wikiのように、作業用ドキュメントとして落ち着いた見た目にする
- 左サイドバー、本文、目次の情報密度を高める
- Markdown本文の読みやすさを優先する
- 一覧と検索結果はスキャンしやすくする
- エラー文言は短く具体的にする
- モバイルでも最低限使えるレスポンシブ対応をする

## 非機能要件

- TypeScriptで実装する
- API呼び出し処理をUIから分離する
- Markdown表示処理をUIから分離する
- 主要操作のテストを書ける構造にする
- バックエンドAPIの型に寄せたDTOを用意する
- 将来の認証追加を邪魔しない構成にする
- SEOを考慮し、記事詳細はクライアントだけで完結させない

## 技術スタック

採用方針:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- react-markdown
- remark-gfm
- rehype-slug
- rehype-autolink-headings
- lucide-react

必要に応じて使う:

- TanStack Query
- Zod

理由:

- SEOと記事詳細ページのmetadataを扱いやすい
- ポートフォリオとしてNext.jsは主流で伝わりやすい
- App Routerでページ単位の責務を分けやすい
- Azure DevOps Wiki風のUIをコンポーネント分割しやすい
- 将来Auth.jsを追加しやすい

使わない方針:

- MVPではServer Actionsでbackendの責務を置き換えない
- GitHub取得やMarkdown/frontmatter解析はExpress backendに寄せる
- frontendは表示、SEO、ルーティング、UIに集中する

## 認証方針

MVPでは認証を実装しない。

理由:

- 記事の正本はGitHub上のMarkdownであり、アプリ上では作成・編集・削除をしない
- まずは公開Wikiとして読める体験を優先する
- backendのClean Architecture構成を主役として見せたい

MVPの運用ルール:

- 公開してよい記事だけ`knowledge-wiki`に置く
- private repositoryを使う場合も、APIが返した記事本文は利用者に見える前提で扱う
- `GITHUB_TOKEN`はbackendの環境変数だけに置く
- frontendへGitHub tokenを渡さない
- API自体は認証なしで公開する

将来の認証候補:

- Auth.js / NextAuth の GitHub Providerを使う
- GitHubアカウントでログインする
- backendはsessionまたはJWTを検証する
- 許可ユーザー、GitHub organization、teamなどで閲覧制限を判断する

認証追加フェーズ:

- Phase 1: 認証なしの公開Wiki
- Phase 2: GitHub OAuthログイン、お気に入り、最近見た記事
- Phase 3: allowlist、organization、teamによる閲覧制限
- Phase 4: GitHub上で編集、またはPull Request作成連携

## ディレクトリ候補

```txt
frontend/
  src/
    app/
      layout.tsx
      page.tsx
      knowledge/
        page.tsx
        [id]/
          page.tsx
      search/
        page.tsx
    features/
      knowledge/
        api/
        components/
        types/
      wiki/
        components/
        types/
    shared/
      api/
      ui/
      markdown/
```

## MVPでやらないこと

- 認証
- リッチテキスト編集
- 画像アップロード
- ブラウザ上での記事作成
- ブラウザ上での記事編集
- ブラウザ上での記事削除
- GitHubへのcommit、pull request作成
- タグ管理専用画面
- ページネーション
- 下書き保存
- 公開、非公開設定

## 次の拡張候補

- GitHub OAuth認証
- Markdown編集
- GitHubへのpull request作成
- タグ一覧
- ページネーション
- 作成者情報
- お気に入り
- 最近見た記事
- デプロイ環境ごとのAPI URL切り替え
