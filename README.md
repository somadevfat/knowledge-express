# Clean Architecture Knowledge App

クリーンアーキテクチャ学習用のナレッジ管理アプリです。

GitHubで管理するMarkdown記事を、Azure DevOps Wikiのように閲覧・検索できるアプリへ育てる方針です。

現在は `backend/` に Express のAPIがあります。次に `frontend/` を追加する想定です。

## 起動

```bash
docker compose up --build
```

API:

- `http://localhost:3000/health`
- `http://localhost:3000/knowledge`

## 構成

```txt
backend/
  src/
  docs/
frontend/
  今後追加予定
docs/
  frontend-requirements.md
```

## バックエンド開発

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## フロントエンド計画

- [フロントエンドMVP要件定義](docs/frontend-requirements.md)
