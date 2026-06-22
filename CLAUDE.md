# 手取りシミュレーター — Claude Code 向けプロジェクト定義

## プロジェクト概要
給与・事業・投資の複合手取り計算ツール。
令和7年分（2025年）の税制に対応し、毎年 /data/tax/{YYYY}.json を
追加することで税制改正に対応する。

## 技術スタック
- Next.js 16 / TypeScript / Tailwind CSS
- 税制データ: /data/tax/{YYYY}.json（年度別JSON）
- 計算ロジック: /lib/tax/calculator.ts（純関数のみ）
- テスト: Jest + ts-jest

## 年次アップデート標準手順
1. 石黒さんから国税庁・協会けんぽの参照URLを受け取る
2. git checkout -b feature/tax-{新年度} でブランチを作成する
3. /data/tax/{新年度}.json を既存JSONを参考に生成する
4. /lib/tax/loader.ts の対応年度リストを更新する
5. /tests/tax/{新年度}.test.ts を生成してテストを通す
6. npm run test && npm run lint && npm run build が全て通ることを確認する
7. PRを作成して石黒さんにレビューを依頼するコメントを出力する

## ディレクトリ構成
/data/tax/             ← 年度別JSONファイル（例: 2025.json）
/lib/tax/              ← 計算ロジック（純関数のみ）
/components/simulator/ ← UIコンポーネント
/tests/tax/            ← 税額計算テスト（年度別）
/tests/components/     ← コンポーネントテスト
/docs/                 ← 運用ドキュメント

## 税制JSONスキーマ（必ずこの構造を維持する）
{
  "year": 2025,
  "label": "令和7年分",
  "version": "1.0.0",
  "incomeTax": { ... },
  "socialInsurance": { ... },
  "deductions": { ... }
}

## 🚫 禁止操作（厳守・例外なし）
- main ブランチへの直接 push 禁止
- .env ファイルの生成・読み書き禁止
- vercel deploy コマンドの実行禁止
- 税率・控除額の数値をソースコードにハードコード禁止
  （必ず /data/tax/{YYYY}.json から読み込むこと）
- /node_modules/ およびドットファイル全般への書き込み禁止
- 外部URLへのフェッチを実装コードに含めること禁止
  （年次更新時の参照は石黒さんが行う）

## コーディング規約
- 税額計算は必ず純関数（引数のみに依存・副作用なし）で実装する
- 関数の JSDoc に計算根拠の条文・速算表の出典を記載する
- 数値は全て円単位の整数で扱う（Math.round() を必ず通す）
- 新機能は tests/ にテストを先に書いてから実装する
- コンポーネントは components/simulator/ 以下に配置する

## 免責表示（UIに必ず表示する文言）
"本ツールは概算です。実際の税額は確定申告・年末調整によります。
必ず国税庁または税理士にご確認ください。"
