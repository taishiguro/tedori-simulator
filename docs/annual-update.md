# 年次税制アップデート手順

## 実施時期
毎年12月〜1月（国税庁・協会けんぽの新年度料率公表後）

## 参照URL（毎年更新して確認）
- 所得税速算表: https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm
- 協会けんぽ保険料率: https://www.kyoukaikenpo.or.jp/about/business/insurance_rate/

## Claude Code への指示文（毎年この文章をそのまま渡す）

来年度（YYYY年分）の税制に対応してください。
参照URL:
- 所得税: https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm
- 社会保険料: https://www.kyoukaikenpo.or.jp/about/business/insurance_rate/
CLAUDE.md の年次アップデート標準手順に従い、
feature/tax-YYYY ブランチで以下を作成してください。
1. data/tax/YYYY.json
2. tests/tax/YYYY.test.ts
完了後にPRを作成してください。

## レビューチェックリスト（PR確認時に必ず実施）
- [ ] 所得税速算表の税率・控除額を国税庁原文と1項目ずつ照合
- [ ] 47都道府県の健康保険料率を協会けんぽ原文と照合
- [ ] 国民年金保険料額を原文と照合
- [ ] CIが全て緑になっていることを確認
- [ ] テストケースが新年度の数値で書かれていることを確認

## カレンダーリマインダー
毎年12月1日にリマインダーを設定してください。
