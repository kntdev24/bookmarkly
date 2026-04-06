# WebApp Starterkit

Vue3 + Hono + Turso による最小構成 Web アプリケーション。新規 Web アプリ開発のベーステンプレートです。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Vue3 + Vite + TypeScript |
| バックエンド | Hono + TypeScript |
| データベース | Turso (libSQL) |
| デプロイ | Netlify |

---

## このテンプレートを使って新規プロジェクトを始める

### 1. リポジトリを作成

GitHub の **"Use this template"** ボタンから新しいリポジトリを作成します。

### 2. プロジェクト名を変更

以下のファイルの `webapp-starterkit` を新しいプロジェクト名に置き換えます。

| ファイル | 変更箇所 |
|---------|---------|
| `package.json` | `name` フィールド |
| `apps/frontend/package.json` | `name` フィールド |
| `apps/backend/package.json` | `name` フィールド |
| `.devcontainer/devcontainer.json` | `name` フィールド・`runArgs` のコンテナ名 |

### 3. 以降は通常のセットアップ手順に従う

---

## 前提条件

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) がインストール済みで起動していること
- [VS Code](https://code.visualstudio.com/) と [Dev Containers 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) がインストール済みであること

## セットアップ

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd <project-name>
```

### 2. Dev Container を起動

VS Code でこのフォルダを開き、コマンドパレット（`Cmd+Shift+P`）から以下を実行します。

```
Dev Containers: Reopen in Container
```

コンテナのビルドと初期化（Node.js のインストール・Turso CLI のインストール・`npm install`）が自動で行われます。完了まで数分かかります。

### 3. DB を初期化（初回のみ）

コンテナ内のターミナルで実行します。

```bash
npm run db:seed -w apps/backend
```

`startmessage` テーブルが作成され、初期データが投入されます。

### 4. 開発サーバーを起動

ターミナルを 2 つ開いてそれぞれ実行します。

```bash
# ターミナル 1: バックエンド（ポート 3000）
npm run dev:backend

# ターミナル 2: フロントエンド（ポート 5173）
npm run dev:frontend
```

ブラウザで http://localhost:5173 を開くと **"Hello WebApp Starterkit!"** が表示されます。

---

## Turso リモート DB を使う場合

ローカル開発ではデフォルトで SQLite ファイル（`apps/backend/local.db`）を使用します。Turso のリモート DB に接続する場合は以下の手順で設定します。

```bash
# Turso にログイン
turso auth login

# DB を作成
turso db create <project-name>

# 接続情報を取得
turso db show <project-name>             # URL を確認
turso db tokens create <project-name>   # 認証トークンを発行
```

取得した値を `.env` ファイルに設定します。

```bash
cp .env.example .env
# .env を編集して TURSO_DATABASE_URL と TURSO_AUTH_TOKEN を設定
```

---

## Netlify へのデプロイ

### 1. Netlify にサイトを作成

[Netlify](https://app.netlify.com/) にログインし、GitHub リポジトリを連携して新しいサイトを作成します。

### 2. ビルド設定

Netlify のサイト設定で以下を指定します。

| 項目 | 値 |
|-----|----|
| Base directory | `apps/frontend` |
| Build command | `npm run build` |
| Publish directory | `apps/frontend/dist` |

### 3. 環境変数を設定

Netlify の **Site configuration > Environment variables** で以下を設定します。

| 変数名 | 値 |
|-------|----|
| `TURSO_DATABASE_URL` | Turso の DB URL |
| `TURSO_AUTH_TOKEN` | Turso の認証トークン |

---

## ディレクトリ構成

```
webapp-starterkit/
├── .devcontainer/
│   └── devcontainer.json   # Dev Container 設定
├── apps/
│   ├── frontend/           # Vue3 + Vite
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   └── App.vue
│   │   ├── index.html
│   │   └── vite.config.ts
│   └── backend/            # Hono + Turso
│       └── src/
│           ├── index.ts
│           └── db/
│               └── seed.ts
├── shared/                 # フロント・バックエンド共通型定義
│   └── types.ts
├── .env.example
└── README.md
```

## 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev:frontend` | フロントエンド開発サーバー起動 |
| `npm run dev:backend` | バックエンド開発サーバー起動 |
| `npm run db:seed -w apps/backend` | DB 初期化（テーブル作成・初期データ投入） |
| `npm run build -w apps/frontend` | フロントエンドをビルド |
