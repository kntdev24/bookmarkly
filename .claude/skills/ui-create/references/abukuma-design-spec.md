# Abukuma デザイン仕様

株式会社ギフティのデザインシステム **Abukuma**（marine-light テーマ）に基づく個人開発アプリ向けUI設計の基本仕様です。

---

## デザインシステム概要

- パッケージ: `@giftee/abukuma-design-tokens`, `@giftee/abukuma-css`
- テーマ: `marine-light`（デフォルト）
- CSS変数プレフィックス: `--ab-semantic-`
- コンポーネントクラスプレフィックス: `.ab-`
- テーマ適用: HTML要素に `data-theme="marine-light"` を付与

---

## 配色

### ブランドカラー（Marine）

| 用途 | トークン名 | 実値 |
|---|---|---|
| ブランド（デフォルト） | `--ab-semantic-color-brand-default` | `#0c6993` |
| ブランド（ライト） | `--ab-semantic-color-brand-light` | `#5097c4` |
| ブランド（最薄） | `--ab-semantic-color-brand-lightest` | `#ebf4fa` |
| ブランド（ダーク） | `--ab-semantic-color-brand-dark` | `#003f65` |
| ブランド（最濃） | `--ab-semantic-color-brand-darkest` | `#002a43` |

### 背景色

| 用途 | トークン名 | 実値 |
|---|---|---|
| ページ背景 | `--ab-semantic-color-background-base` | `#f6f7f8` |
| カード・パネル | `--ab-semantic-color-background-rest-primary` | `#ffffff` |
| セカンダリ背景 | `--ab-semantic-color-background-rest-secondary` | `#eaeef0` |
| ブランド背景 | `--ab-semantic-color-background-brand-primary` | `#0c6993` |
| ブランドアクセント背景 | `--ab-semantic-color-background-brand-secondary` | `#ebf4fa` |
| 無効 | `--ab-semantic-color-background-disabled` | `#d9d9d9` |
| 成功（プライマリ） | `--ab-semantic-color-background-positive-primary` | `#32cd32` |
| 成功（セカンダリ） | `--ab-semantic-color-background-positive-secondary` | `#f0faf0` |
| エラー（プライマリ） | `--ab-semantic-color-background-negative-primary` | `#b21b00` |
| エラー（セカンダリ） | `--ab-semantic-color-background-negative-secondary` | `#fff4f2` |
| 警告 | `--ab-semantic-color-background-notice-primary` | `#ff6347` |
| 情報 | `--ab-semantic-color-background-info-primary` | `#1e90ff` |
| 情報（セカンダリ） | `--ab-semantic-color-background-info-secondary` | `#ebf5ff` |
| オーバーレイ | `--ab-semantic-color-background-overlay` | `rgba(35,35,35,0.70)` |

### テキスト色

| 用途 | トークン名 | 実値 |
|---|---|---|
| 本文（デフォルト） | `--ab-semantic-color-text-default` | `#4e5b61` |
| サブテキスト | `--ab-semantic-color-text-secondary` | `#899295` |
| ブランド | `--ab-semantic-color-text-brand` | `#0c6993` |
| ブランド（セカンダリ） | `--ab-semantic-color-text-brand-secondary` | `#5097c4` |
| コントラスト（白背景上） | `--ab-semantic-color-text-contrast` | `#ffffff` |
| 情報 | `--ab-semantic-color-text-info` | `#1e90ff` |
| 警告 | `--ab-semantic-color-text-notice` | `#ff6347` |
| 成功 | `--ab-semantic-color-text-positive` | `#32cd32` |
| エラー | `--ab-semantic-color-text-negative` | `#b21b00` |
| 無効 | `--ab-semantic-color-text-disable` | `#777777` |

### ボーダー色

| 用途 | トークン名 | 実値 |
|---|---|---|
| ブランド | `--ab-semantic-color-border-brand` | `#0c6993` |
| 強調 | `--ab-semantic-color-border-bold` | `#899295` |
| 通常 | `--ab-semantic-color-border-light` | `#e1e7ea` |
| ニュートラル | `--ab-semantic-color-border-neutral` | `#bbbbbb` |
| 情報 | `--ab-semantic-color-border-info` | `#1e90ff` |
| 警告 | `--ab-semantic-color-border-notice` | `#ff6347` |
| 成功 | `--ab-semantic-color-border-positive` | `#32cd32` |
| エラー | `--ab-semantic-color-border-negative` | `#b21b00` |
| 無効 | `--ab-semantic-color-border-disable` | `#bbbbbb` |

---

## フォント

- 日本語: **Noto Sans JP**（Google Fonts）
- 英数字: **Avenir**
- フォントスタック: `'Avenir', 'Noto Sans JP', sans-serif`

### フォントサイズスケール

| トークン名 | サイズ | 用途 |
|---|---|---|
| `headline-l` | 24px | 画面タイトル |
| `headline-m` | 20px | セクション見出し |
| `headline-s` | 16px | カード見出し・ラベル |
| `body-m` | 16px | 本文 |
| `body-s` | 14px | サブテキスト・ラベル |
| `body-xs` | 12px | キャプション・バッジ |

### フォントウェイト

| トークン名 | 値 |
|---|---|
| `regular` | 400 |
| `bold` | 700 |

---

## レイアウト

- 対応デバイス: モバイル・デスクトップ両対応（レスポンシブ）
- ページ背景: `--ab-semantic-color-background-base` = `#f6f7f8`
- コンテンツ最大幅: 1280px（中央寄せ）

### ブレークポイント

| 名前 | 値 | 用途 |
|---|---|---|
| sm | 544px | スマホ横向き〜 |
| md | 768px | タブレット〜 |
| lg | 1012px | デスクトップ〜 |
| xl | 1280px | ワイドデスクトップ〜 |

---

## スペーシング

セマンティックスペーシングトークン（`--ab-semantic-spacing-N`）を使用します。

| トークン | 値 |
|---|---|
| `--ab-semantic-spacing-0` | 0px |
| `--ab-semantic-spacing-1` | 4px |
| `--ab-semantic-spacing-2` | 8px |
| `--ab-semantic-spacing-4` | 16px |
| `--ab-semantic-spacing-6` | 24px |
| `--ab-semantic-spacing-8` | 32px |
| `--ab-semantic-spacing-10` | 40px |
| `--ab-semantic-spacing-12` | 48px |
| `--ab-semantic-spacing-16` | 64px |
| `--ab-semantic-spacing-20` | 80px |

---

## ボーダー

### 角丸（border-radius）

| トークン名 | 値 | 用途 |
|---|---|---|
| `--ab-semantic-border-radius-none` | 0px | - |
| `--ab-semantic-border-radius-xs` | 4px | バッジ・小要素 |
| `--ab-semantic-border-radius-sm` | 8px | 入力フィールド |
| `--ab-semantic-border-radius-md` | 16px | カード |
| `--ab-semantic-border-radius-lg` | 32px | モーダル・大カード |
| `--ab-semantic-border-radius-full` | 9999px | ボタン・pill・アバター |

### ボーダー幅

| トークン名 | 値 |
|---|---|
| `--ab-semantic-border-width-0` | 0px |
| `--ab-semantic-border-width-1` | 1px |
| `--ab-semantic-border-width-2` | 2px |

### ボーダースタイル（標準）

```scss
border: var(--ab-semantic-border-width-1) solid var(--ab-semantic-color-border-light);
```

---

## コンポーネント

### ボタン（`.ab-Button`）

| バリアント | クラス | 背景色 | テキスト色 | 用途 |
|---|---|---|---|---|
| Filled（主要） | `.ab-Button` | `#0c6993` | `#ffffff` | 主要アクション |
| Outlined | `.ab-Button-outlined` | `#ffffff` | `#0c6993` | サブアクション |
| Negative | `.ab-Button-negative` | `#ffffff` | `#b21b00` | 削除・破壊的操作 |
| Neutral | `.ab-Button-neutral` | `#ffffff` | `#4e5b61` | 汎用アクション |
| Text | `.ab-Button-text` | 透明 | `#0c6993` | テキストリンク的操作 |

- 角丸: `full`（pill型、9999px）
- ボーダー: 2px solid
- サイズ:
  - xsmall: 高さ36px、font-size 12px
  - small（デフォルト）: 高さ42px、font-size 14px
  - large: 高さ56px、font-size 16px

### 入力フィールド（`.ab-Textfield`）

- 高さ: 48px
- 背景: `#ffffff`
- ボーダー: `1px solid #e1e7ea`
- ボーダー（ホバー・フォーカス）: `1px solid #899295`（bold）
- 角丸: sm（8px）
- テキスト色: `#4e5b61`
- プレースホルダー: `#899295`
- 無効状態: 背景 `#d9d9d9`、テキスト `#899295`

---

## アイコン

- セット: `@giftee/abukuma-css` 内のアイコン、または Material Symbols / Lucide と組み合わせ可
- サイズ:
  - xxsmall: 12px
  - xsmall: 14px
  - small: 16px
  - medium: 21px

---

## CSS変数の読み込み方法

```html
<!-- デザイントークンの読み込み -->
<link rel="stylesheet" href="node_modules/@giftee/abukuma-design-tokens/dist/index.css">
<!-- または CDN / ローカルビルド -->

<!-- テーマの適用 -->
<html data-theme="marine-light">
```

HTMLモックとして単体で使う場合は、`:root` にトークン値を直接定義してください：

```css
:root {
  /* Brand */
  --ab-semantic-color-brand-default: #0c6993;
  --ab-semantic-color-brand-light: #5097c4;
  --ab-semantic-color-brand-lightest: #ebf4fa;

  /* Background */
  --ab-semantic-color-background-base: #f6f7f8;
  --ab-semantic-color-background-rest-primary: #ffffff;
  --ab-semantic-color-background-rest-secondary: #eaeef0;
  --ab-semantic-color-background-brand-primary: #0c6993;
  --ab-semantic-color-background-disabled: #d9d9d9;

  /* Text */
  --ab-semantic-color-text-default: #4e5b61;
  --ab-semantic-color-text-secondary: #899295;
  --ab-semantic-color-text-brand: #0c6993;
  --ab-semantic-color-text-contrast: #ffffff;
  --ab-semantic-color-text-notice: #ff6347;
  --ab-semantic-color-text-negative: #b21b00;
  --ab-semantic-color-text-positive: #32cd32;
  --ab-semantic-color-text-disable: #777777;

  /* Border */
  --ab-semantic-color-border-brand: #0c6993;
  --ab-semantic-color-border-bold: #899295;
  --ab-semantic-color-border-light: #e1e7ea;
  --ab-semantic-color-border-negative: #b21b00;

  /* Spacing */
  --ab-semantic-spacing-1: 4px;
  --ab-semantic-spacing-2: 8px;
  --ab-semantic-spacing-4: 16px;
  --ab-semantic-spacing-6: 24px;
  --ab-semantic-spacing-8: 32px;

  /* Border Radius */
  --ab-semantic-border-radius-xs: 4px;
  --ab-semantic-border-radius-sm: 8px;
  --ab-semantic-border-radius-md: 16px;
  --ab-semantic-border-radius-full: 9999px;

  /* Border Width */
  --ab-semantic-border-width-1: 1px;
  --ab-semantic-border-width-2: 2px;
}
```
