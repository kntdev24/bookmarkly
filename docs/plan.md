# Implementation Plan
## Bookmarkly

| 項目 | 内容 |
|------|------|
| 作成日 | 2026-04-06 |
| 対象 | Phase 1（MVP）→ Phase 2 |

---

## 現状

| 対象 | 状態 |
|------|------|
| バックエンド | Hono + libsql のスターター。`/api/message` のみ |
| フロントエンド | Vue 3 + Vite のスターター。ルーティングなし |
| DB | `startmessage` テーブルのみ |

---

## Phase 1（MVP）

### Step 1: 共通型定義

**`packages/shared/types.ts`** を作成し、フロント・バックエンドで共有する型を定義する。

```
Bookmark, BookmarkStatus, ContentType
```

- `packages/shared/package.json` を追加し、`package.json`（ルート）の workspaces に追加

---

### Step 2: DBスキーマ定義・マイグレーション

**`apps/backend/src/db/migrate.ts`** を作成。

```sql
CREATE TABLE IF NOT EXISTS bookmarks (
  id           TEXT PRIMARY KEY,
  user_id      TEXT,
  url          TEXT,
  title        TEXT,
  memo         TEXT,
  tags         TEXT DEFAULT '[]',
  status       TEXT NOT NULL DEFAULT 'unread',
  content_type TEXT NOT NULL DEFAULT 'other',
  thumbnail_url TEXT,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);
```

- `package.json` に `"db:migrate": "tsx src/db/migrate.ts"` スクリプトを追加
- 既存の `db:seed` は削除または `startmessage` テーブルを残さない形に更新

---

### Step 3: バックエンド API（ブックマーク CRUD）

**`apps/backend/src/routes/bookmarks.ts`** を作成し、`index.ts` にマウント。

| メソッド | パス | 概要 |
|---------|------|------|
| GET | `/api/bookmarks` | 一覧取得（`?q=`検索、`?status=`フィルタ） |
| GET | `/api/bookmarks/:id` | 詳細取得 |
| POST | `/api/bookmarks` | 新規登録 |
| PATCH | `/api/bookmarks/:id` | 更新（ステータス変更・編集） |
| DELETE | `/api/bookmarks/:id` | 削除 |

---

### Step 4: バックエンド API（OGP取得）

**`apps/backend/src/routes/ogp.ts`** を作成。

| メソッド | パス | 概要 |
|---------|------|------|
| GET | `/api/ogp?url=` | URLからOGP情報（タイトル・サムネイル）を取得して返す |

- `node-fetch` でHTMLを取得し、`<meta property="og:*">` タグをパース
- タイムアウト・エラー時は空オブジェクトを返す（登録をブロックしない）

---

### Step 5: フロントエンド 基盤整備

1. **`vue-router`** を追加
   ```
   npm install vue-router -w frontend
   ```
2. **`apps/frontend/src/router/index.ts`** を作成
3. **`apps/frontend/src/main.ts`** にルーターを登録
4. **`apps/frontend/src/App.vue`** を `<RouterView />` のみに変更

ルート定義:

| パス | コンポーネント |
|------|--------------|
| `/` | `DashboardView.vue` |
| `/bookmarks` | `BookmarkListView.vue` |
| `/bookmarks/entry` | `BookmarkEntryView.vue` |
| `/bookmarks/:id` | `BookmarkDetailView.vue` |

---

### Step 6: フロントエンド 画面実装（Phase 1）

実装順：

1. **共通コンポーネント**
   - `AppHeader.vue` — ナビゲーション（ダッシュボード / 一覧 / 登録）
   - `BookmarkCard.vue` — ブックマーク1件のカード表示（サムネイル・タイトル・タグ・ステータス）

2. **ダッシュボード** `DashboardView.vue`
   - 未読リストをセクション上部に表示
   - 最近追加したブックマーク一覧

3. **新規登録** `BookmarkEntryView.vue`
   - URL入力 → OGP自動取得（デバウンス）
   - タイトル手動編集
   - メモ入力
   - 登録ボタン

4. **一覧** `BookmarkListView.vue`
   - 全ブックマーク一覧
   - 検索バー（タイトル・メモ・タグ）
   - ステータス変更（既読にする）ボタン

5. **詳細・編集** `BookmarkDetailView.vue`
   - 詳細表示
   - タイトル・メモ・タグの編集
   - ステータス変更
   - 削除

---

### Step 7: APIクライアント整備

**`apps/frontend/src/api/bookmarks.ts`** を作成し、fetch呼び出しをラップ。
**`apps/frontend/src/api/ogp.ts`** を作成。

---

## Phase 2

### Step 8: DBスキーマ更新（Userテーブル追加）

`migrate.ts` を更新：

```sql
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);
```

- `bookmarks.user_id` にFK制約を追加（既存データは `user_id = NULL` のまま）

---

### Step 9: バックエンド 認証API

**`apps/backend/src/routes/auth.ts`** を作成。

| メソッド | パス | 概要 |
|---------|------|------|
| POST | `/api/auth/register` | メール＋パスワードでユーザー登録 |
| POST | `/api/auth/login` | ログイン → JWTを返す |

- パッケージ追加: `jose`（JWT）、`@node-rs/bcrypt` or `bcryptjs`（パスワードハッシュ）
- **`apps/backend/src/middleware/auth.ts`** — JWTを検証するミドルウェアを作成
- ブックマークCRUDに認証ミドルウェアを適用

---

### Step 10: バックエンド AIタグ付け

**`apps/backend/src/services/tagger.ts`** を作成。

- パッケージ追加: `@anthropic-ai/sdk`
- ブックマーク登録API（POST `/api/bookmarks`）のレスポンス後に非同期でタグ生成
- 生成したタグで `bookmarks.tags` を更新（PATCH）

プロンプト方針：
- URLのドメイン・タイトル・メモを入力として渡す
- `content_type` の自動判定も同時に行う
- タグは最大5件、JSON配列で返させる

---

### Step 11: フロントエンド 認証画面実装

4. **ログイン** `LoginView.vue`（mockup: `bookmarkly-login.html` 参照）
5. **アカウント登録** `RegisterView.vue`（mockup: `bookmarkly-register.html` 参照）

ルート追加:

| パス | コンポーネント |
|------|--------------|
| `/login` | `LoginView.vue` |
| `/register` | `RegisterView.vue` |

- **`apps/frontend/src/stores/auth.ts`**（Pinia or `ref`）でJWTと認証状態を管理
- 未認証時のルートガード設定

---

### Step 12: フロントエンド フィルタリング強化

`BookmarkListView.vue` を拡張：

- タグ別フィルタ
- コンテンツ種別フィルタ
- 未読のみ表示フィルタ

---

## 追加パッケージ一覧

| パッケージ | 対象 | フェーズ |
|-----------|------|---------|
| `vue-router` | frontend | Phase 1 |
| `node-fetch` | backend | Phase 1 |
| `jose` | backend | Phase 2 |
| `bcryptjs` + `@types/bcryptjs` | backend | Phase 2 |
| `@anthropic-ai/sdk` | backend | Phase 2 |

---

## ディレクトリ構成（完成形）

```
bookmarkly/
├── apps/
│   ├── backend/
│   │   └── src/
│   │       ├── db/
│   │       │   ├── migrate.ts
│   │       │   └── client.ts        # DB接続をシングルトン化
│   │       ├── middleware/
│   │       │   └── auth.ts          # Phase 2
│   │       ├── routes/
│   │       │   ├── bookmarks.ts
│   │       │   ├── ogp.ts
│   │       │   └── auth.ts          # Phase 2
│   │       ├── services/
│   │       │   └── tagger.ts        # Phase 2
│   │       └── index.ts
│   └── frontend/
│       └── src/
│           ├── api/
│           │   ├── bookmarks.ts
│           │   └── ogp.ts
│           ├── components/
│           │   ├── AppHeader.vue
│           │   └── BookmarkCard.vue
│           ├── router/
│           │   └── index.ts
│           ├── stores/
│           │   └── auth.ts          # Phase 2
│           ├── views/
│           │   ├── DashboardView.vue
│           │   ├── BookmarkListView.vue
│           │   ├── BookmarkEntryView.vue
│           │   ├── BookmarkDetailView.vue
│           │   ├── LoginView.vue    # Phase 2
│           │   └── RegisterView.vue # Phase 2
│           ├── App.vue
│           └── main.ts
└── packages/
    └── shared/
        ├── package.json
        └── types.ts
```

---

## Phase 3（インフラ・デプロイ）

### 概要

| 項目 | 内容 |
|------|------|
| フロントエンド | Netlify（静的ホスティング） |
| バックエンド | Netlify Functions（Hono） |
| DB | Turso クラウド |

---

### Step 13: Turso クラウド DB セットアップ

Turso アカウント内でデータベースを作成し、接続情報を取得する。

```bash
# DB作成
turso db create bookmarkly

# 接続URLとauth tokenを確認
turso db show bookmarkly
turso db tokens create bookmarkly
```

取得した値をローカルの `.env` に設定し、マイグレーションを実行：

```bash
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
npm run db:migrate -w backend
```

---

### Step 14: バックエンドを Netlify Functions 対応に改修

現在の `index.ts` は `@hono/node-server` の `serve()` で起動している。Netlify Functions では `handler` をエクスポートする形式が必要なため、アプリ定義とサーバー起動を分離する。

**`apps/backend/src/app.ts`** を新規作成し、Hono app を定義してエクスポート：

```ts
// app の定義・routes のマウントのみ。serve() は含めない
export { app }
```

**`apps/backend/src/index.ts`** をローカル開発専用に変更：

```ts
import { serve } from '@hono/node-server'
import { app } from './app.js'

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log('Backend running on http://localhost:3000')
})
```

**`netlify/functions/api.ts`** を新規作成（リポジトリルートに配置）：

```ts
import { handle } from 'hono/netlify'
import { app } from '../../apps/backend/src/app.js'

export const handler = handle(app)
```

`@libsql/client` はサーバーレス環境向けに HTTP モードで import する：

```ts
// apps/backend/src/db/client.ts
import { createClient } from '@libsql/client/http'
```

---

### Step 15: netlify.toml の作成

リポジトリルートに `netlify.toml` を作成：

```toml
[build]
  command = "npm run build -w frontend"
  publish = "apps/frontend/dist"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- `/api/*` のリクエストは Netlify Functions へリダイレクト（フロントエンドの Vite proxy 設定と対称）
- `/*` → `/index.html` は Vue Router の SPA ルーティング用

---

### Step 16: 環境変数の整備

**`.env.example`** を更新（バックエンド用）：

```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
JWT_SECRET=your-secret
ANTHROPIC_API_KEY=sk-ant-...
```

**Netlify 管理画面**（Site settings → Environment variables）で上記4つを設定する。

---

### Step 17: Netlify デプロイ・動作確認

1. Netlify サイトと GitHub リポジトリが連携済みであることを確認
2. Netlify 管理画面で環境変数を設定（Step 16）
3. `main` ブランチへ push → Netlify が自動でビルド・デプロイ
4. デプロイ後、本番 Turso DB に対してマイグレーションを実行：

```bash
TURSO_DATABASE_URL=<本番URL> TURSO_AUTH_TOKEN=<本番token> npm run db:migrate -w backend
```

5. ブラウザで本番 URL を開き、以下を確認：
   - ブックマーク登録・一覧表示
   - ログイン・新規登録
   - AIタグ付けの動作

---

### 追加パッケージ

| パッケージ | 対象 | 用途 |
|-----------|------|------|
| （追加なし） | — | Hono の Netlify アダプターは `hono/netlify` として本体に同梱済み |

---

### ディレクトリ追加分

```
bookmarkly/
├── netlify/
│   └── functions/
│       └── api.ts          # Hono を Netlify Functions として export
├── netlify.toml            # ビルド・リダイレクト設定
└── apps/
    └── backend/
        └── src/
            ├── app.ts      # Hono app 定義（新規・serve なし）
            └── index.ts    # ローカル開発用サーバー起動（既存を変更）
```

---

## 未決事項への回答

| 項目 | 方針 |
|------|------|
| AIタグ付けのタイミング | 登録APIレスポンス後に非同期実行（ユーザーを待たせない） |
| Tursoスキーマ詳細 | `migrate.ts` で `CREATE TABLE IF NOT EXISTS` を管理。インデックスは `status`・`created_at` に付与 |
| Phase 1の認証なし運用 | `user_id = NULL` で登録。Phase 1はユーザー識別なしで動作させる |

---

## Phase 3.5（レイアウト調整）

### 概要

| 対象 | 変更内容 |
|------|---------|
| ログイン・登録画面 | サイドバーを非表示にする |
| ブックマーク一覧 | タイトル下にURLを表示、タイトル/URLクリックで新規タブ |
| ブックマーク詳細 | URLを表示する |

---

### Step 18: ログイン・登録画面のサイドバー非表示

現在 `App.vue` は全ルートで `<AppSidebar />` を描画している。`/login` と `/register` ではサイドバーが不要なため、ルートメタを使って条件分岐する。

**`apps/frontend/src/router/index.ts`** — `/login` と `/register` に `meta: { noLayout: true }` を追加：

```ts
{ path: '/login',    component: LoginView,    meta: { noLayout: true } },
{ path: '/register', component: RegisterView, meta: { noLayout: true } },
```

**`apps/frontend/src/App.vue`** — `useRoute` でメタを参照し、サイドバーとトップバーを条件付きレンダリング：

```vue
<script setup lang="ts">
const route = useRoute();
const isNoLayout = computed(() => !!route.meta.noLayout);
</script>

<template>
  <div :class="isNoLayout ? 'app-auth' : 'app-layout'">
    <AppSidebar v-if="!isNoLayout" />
    <main class="main">
      <header v-if="!isNoLayout" class="topbar">...</header>
      <RouterView />
    </main>
  </div>
</template>
```

---

### Step 19: ブックマーク一覧のURL表示とリンク化

**`apps/frontend/src/components/BookmarkCard.vue`** を修正：

- タイトル下に `<p class="card-url">{{ bookmark.url }}</p>` を追加
- タイトルと URL を `<a :href="bookmark.url" target="_blank" rel="noopener noreferrer">` でラップ
- カード全体のクリックによるルーター遷移（詳細画面）は維持したまま、タイトル/URL のリンク部分は `@click.stop` で伝播を止める

変更箇所イメージ：

```vue
<a :href="bookmark.url" target="_blank" rel="noopener noreferrer" @click.stop>
  <p class="card-title">{{ bookmark.title ?? bookmark.url }}</p>
  <p class="card-url">{{ bookmark.url }}</p>
</a>
```

---

### Step 20: ブックマーク詳細画面のURL表示

**`apps/frontend/src/views/BookmarkDetailView.vue`** のテンプレートにURL表示を追加：

```vue
<a :href="bookmark.url" target="_blank" rel="noopener noreferrer" class="detail-url">
  {{ bookmark.url }}
</a>
```

ドメインを別途 `computed` で取得している箇所の近くに配置し、フルURLを視認できるようにする。

---

## Phase 4（記事要約 & 自動既読）

### 概要

| 機能 | 内容 |
|------|------|
| 記事要約 | URLをスクレイピングして本文を取得し、Claude APIで要約して詳細画面に表示 |
| 自動既読 | 一覧・詳細画面でURLを新規タブ表示したタイミングでステータスを `read` に変更 |

---

### Step 21: バックエンド 記事要約API

**`apps/backend/src/routes/summarize.ts`** を新規作成し、`app.ts` にマウント。

| メソッド | パス | 概要 |
|---------|------|------|
| POST | `/api/bookmarks/:id/summarize` | 該当ブックマークのURLをスクレイピングして要約を返す |

処理フロー：

1. DBからブックマークのURLを取得
2. `node-fetch` でHTMLを取得（タイムアウト10秒）
3. HTMLから本文を抽出（`<article>`・`<main>`・`<p>` タグを優先して文字列化）
4. `@anthropic-ai/sdk` の `messages.create()` に本文を渡し、日本語で要約させる
5. 要約テキストをレスポンスとして返す（DBには保存しない）

プロンプト方針：

```
以下の記事本文を日本語で3〜5文に要約してください。要約のみ出力し、前置き・後書きは不要です。
---
{本文}
```

エラー処理：
- スクレイピング失敗・タイムアウト → 422 でエラーメッセージを返す
- Claude API エラー → 502 で返す

---

### Step 22: フロントエンド 記事要約の表示

**`apps/frontend/src/api/bookmarks.ts`** に `summarizeBookmark(id)` を追加：

```ts
export async function summarizeBookmark(id: string): Promise<string> {
  const res = await fetch(`/api/bookmarks/${id}/summarize`, { method: 'POST', headers: authHeaders() });
  const data = await res.json();
  return data.summary as string;
}
```

**`apps/frontend/src/views/BookmarkDetailView.vue`** に要約セクションを追加：

- 「要約を生成」ボタンを表示
- クリック時に `summarizeBookmark()` を呼び出し、ローディング中はスピナーを表示
- 結果を `summary` ref に格納してテキストエリアまたは `<p>` で表示
- エラー時はエラーメッセージを表示

---

### Step 23: URL開封時の自動既読

URLを新規タブで開く `<a>` タグのクリックイベントで `updateBookmark(id, { status: 'read' })` を呼ぶ。

**`apps/frontend/src/components/BookmarkCard.vue`**：

```ts
async function openUrl(e: MouseEvent) {
  // デフォルトの新規タブ動作は維持（preventDefault しない）
  if (props.bookmark.status === 'unread') {
    await updateBookmark(props.bookmark.id, { status: 'read' });
    emit('statusChanged', props.bookmark.id, 'read');
  }
}
```

**`apps/frontend/src/views/BookmarkDetailView.vue`**：

- 詳細画面のURLリンクにも同様の `@click` ハンドラを追加
- 既読に変更後はローカルの `bookmark.value.status` も更新してUIを即時反映

---

### 追加パッケージ（Phase 4）

| パッケージ | 対象 | 用途 |
|-----------|------|------|
| （追加なし） | — | `@anthropic-ai/sdk`・`node-fetch` は Phase 2 で導入済み |

---

### 変更ファイル一覧（Phase 3.5 〜 4）

```
apps/
├── backend/
│   └── src/
│       └── routes/
│           └── summarize.ts          # 新規: 記事要約API (Phase 4)
└── frontend/
    └── src/
        ├── App.vue                   # noLayout メタ対応 (Phase 3.5)
        ├── router/index.ts           # /login・/register に noLayout 追加 (Phase 3.5)
        ├── api/
        │   └── bookmarks.ts          # summarizeBookmark 追加 (Phase 4)
        ├── components/
        │   └── BookmarkCard.vue      # URL表示・リンク化・自動既読 (Phase 3.5, 4)
        └── views/
            └── BookmarkDetailView.vue # URL表示・要約セクション・自動既読 (Phase 3.5, 4)
```
