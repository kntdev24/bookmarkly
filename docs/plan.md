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

## Phase 3 について

**Phase 2 完了後に要件を改めて整理し、plan.md に追記する。**

prd.md に記載の Phase 3 候補（アーカイブ機能・ランダム再表示）はまだ粗い段階であり、Phase 2 の実装を通じて要件が具体化してから計画を立てる。Phase 3 の実装に入る前に必ず本セクションを更新すること。

---

## 未決事項への回答

| 項目 | 方針 |
|------|------|
| AIタグ付けのタイミング | 登録APIレスポンス後に非同期実行（ユーザーを待たせない） |
| Tursoスキーマ詳細 | `migrate.ts` で `CREATE TABLE IF NOT EXISTS` を管理。インデックスは `status`・`created_at` に付与 |
| Phase 1の認証なし運用 | `user_id = NULL` で登録。Phase 1はユーザー識別なしで動作させる |
