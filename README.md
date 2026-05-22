# 自己学習用：動的フォーム生成（Meta UI）

## 詳細設計（フロントエンドのみ）

### 1. DB・データモデル設計

- **MetaFormFieldsTable**
  - `FormId`: string (PartitionKey) - フォームの識別子（例: 'USER_PROFILE' > プロフィール入力フォーム）
  - `fields`: MetaFormField[] - フォームを構成する項目の配列
- **MetaFormField (Zod Schema / TS Type)**
  - `key`: string (一意の識別子、定数値のマジックストリング排除のため `as const` 定義を推奨)
  - `label`: string (画面表示名)
  - `controlType`: 'text' | 'select'
  - `options`?: { value: string, label: string }[] (select時のみ必須)

---

### 2. コンポーネント設計 (meta-form)

- **ロジック (ts)**
  - `withComponentInputBinding` を経由して、RouterData から `fields` (メタデータ) を `@Input` としてインジェクトする。
  - Angular **Reactive Forms** (`FormGroup`, `FormControl`) を用い、`fields` の内容から動的にフォームコントロールを生成する。
  - フォーム全体の入力値は `{ [key: string]: string }` のディクショナリ形式でリアルタイムに管理・更新する。
  - 項目が0個の場合は、コンポーネント初期化時（`ngOnInit`）に `window.alert('表示するフォーム項目がありません。')` を実行し処理を中断する。

- **テンプレート (html)**
  - `@for` ディレクティブで `fields` をループ処理する。
  - `@if` ディレクティブを用い、`controlType` に応じて **Angular Material** コンポーネントを以下ルールで動的に切り替える。

    #### 【UIコンポーネントマッピングルール】
    - **`controlType === 'text'`**
      - 適用コンポーネント: `<mat-form-field>` + `<input matInput>`
    - **`controlType === 'select'`**
      - 適用コンポーネント: `<mat-form-field>` + `<mat-select>` + `<mat-option>`
      - ※ `field.options` をさらに内部で `@for` ループさせて選択肢を展開する。

---

### 3. テスト仕様 (meta-form.component.spec.ts)

設計の正しさを担保するため、以下の受け入れ基準に基づく単体テスト（Jasmine/Jest）を実装する。

- **正常系テスト**
  - `text` が渡された際、画面上に `<input matInput>` が正しく1つ描画されること。
  - `select` と `options` が渡された際、画面上に `<mat-select>` が描画され、クリック時に選択肢が展開されること。
  - `text` と `select` が混在したメタデータでも、崩れることなく指定順通りに表示されること。
  - どちらか片方（例: `text` のみ）のデータであってもクラッシュせず正しく表示されること。
- **異常系テスト**
  - `fields` 配列の要素数が0（または空）のとき、画面描画をスキップし `window.alert` が1回呼び出されること。
  - `controlType: 'select'` にもかかわらず `options` が `undefined` で届いた場合、システムがクラッシュせず安全に（空のセレクトボックスとして）耐えられること。
