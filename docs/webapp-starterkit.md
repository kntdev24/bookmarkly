# WebApp Starterkit
## このドキュメントの位置づけ
このドキュメントはWebアプリケーションの最小構成となる開発キットを作成するための構想メモです。

# 開発キットの役割
ブラウザで利用するWebアプリケーションを開発するための基本セット。
Vue3 + Hono + Tursoで構築するWebアプリケーションの最小構成を提供する。
開発はdev containerを利用する。turso cliなどのツール類は、ホストではなくdev container内にインストールする。

# アーキテクチャ
- 開発言語: TypeScript
- フロントエンド: Vue3
- バックエンド: Hono
- データベース: Turso
- デプロイ環境: Netlify

# ディレクトリ構成

webapp-starterkit/
├── .devcontainer/
│   └── devcontainer.json
├── apps/
│   ├── frontend/                 # フロントエンド（Vue 3）
│   └── backend/                  # バックエンド（Hono）
├── shared/                       # フロント・バックエンド共通
├── docs/
│   └── webapp-starterkit.md
└── README.md

# 実装内容
- フロントエンド
  - バックエンドのAPIをコールし、取得した文字列をブラウザに表示する
- バックエンド
  - DBのstartmessageから1行セレクトしてフロントエンドに返す
- DB
  - startmessageテーブルに1行のレコードが作成されており、"Hello WebApp Starterkit!"という文字列が格納されている

