'use client'

import { TedoriResult } from '@/lib/tax/types'

interface ResultPanelProps {
  result: TedoriResult
}

function fmt(n: number) {
  return n.toLocaleString('ja-JP')
}

function SummaryCard({
  label,
  sublabel,
  value,
  monthly,
  color,
}: {
  label: string
  sublabel: string
  value: number
  monthly: number
  color: 'blue' | 'green'
}) {
  const bgClass = color === 'blue' ? 'bg-blue-600 border-blue-700' : 'bg-green-600 border-green-700'
  const subClass = color === 'blue' ? 'text-blue-200' : 'text-green-200'
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${bgClass} text-white`}>
      <p className={`text-xs mb-0.5 ${subClass}`}>{label}</p>
      <p className={`text-[10px] mb-1.5 ${subClass}`}>{sublabel}</p>
      <p className="font-bold text-lg text-white">
        {fmt(value)}{' '}
        <span className={`text-xs font-normal ${subClass}`}>円</span>
      </p>
      <p className={`text-sm mt-1 ${subClass}`}>
        月額 <span className="font-semibold text-white">{fmt(monthly)}</span> 円
      </p>
    </div>
  )
}

function SmallCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-700 mb-1">{label}</p>
      <p className="font-bold text-lg text-gray-900">
        {fmt(value)}{' '}
        <span className="text-xs font-normal text-gray-700">円</span>
      </p>
    </div>
  )
}

const BREAKDOWN_ROWS: { label: string; key: keyof Omit<TedoriResult, 'grossBreakdown'>; negative?: boolean }[] = [
  { label: '給与所得', key: 'kyuyoShotoku' },
  { label: '　うち給与所得控除', key: 'kyuyoKojo', negative: true },
  { label: '事業所得', key: 'jigyoShotoku' },
  { label: '総合課税所得合計', key: 'sogoIncome' },
  { label: '課税所得（控除後）', key: 'taxableIncome' },
  { label: '所得税（基準額）', key: 'sogoTax' },
  { label: '復興特別所得税', key: 'fukkoTax' },
  { label: '所得税合計（住宅ローン控除適用後）', key: 'totalSogoTax' },
  { label: '分離課税（株式・配当）', key: 'bunriTax' },
  { label: '住民税（概算10%）', key: 'juminTax' },
  { label: '社会保険料', key: 'shakai' },
  { label: '税・社保 合計負担', key: 'totalTax' },
]

function GrossBreakdownSection({ b }: { b: TedoriResult['grossBreakdown'] }) {
  const items: { label: string; value: number; indent?: boolean }[] = []

  const salarytotal = b.salary + b.bonus
  if (salarytotal > 0) {
    items.push({ label: '給与収入（月次合計）', value: salarytotal })
    if (b.bonus > 0) items.push({ label: '　うち賞与', value: b.bonus, indent: true })
  }
  if (b.jigyoRevenue > 0 || b.jigyoShotoku !== 0) {
    if (b.jigyoRevenue > 0) items.push({ label: '事業売上合計', value: b.jigyoRevenue })
    if (b.jigyoExpense > 0) items.push({ label: '　うち事業経費', value: b.jigyoExpense, indent: true })
    if (b.jigyoRevenue > 0 || b.jigyoShotoku !== 0) {
      items.push({ label: '　事業所得', value: b.jigyoShotoku, indent: true })
    }
  }
  if (b.fudosanRevenue > 0 || b.fudosanShotoku !== 0) {
    if (b.fudosanRevenue > 0) items.push({ label: '不動産収入合計', value: b.fudosanRevenue })
    if (b.fudosanExpense > 0) items.push({ label: '　うち不動産経費', value: b.fudosanExpense, indent: true })
    items.push({ label: '　不動産所得', value: b.fudosanShotoku, indent: true })
  }
  if (b.haito > 0) items.push({ label: '配当所得', value: b.haito })
  if (b.kabuGain > 0) items.push({ label: '株式売却益', value: b.kabuGain })
  if (b.kabuLoss > 0) items.push({ label: '　うち株式売却損', value: b.kabuLoss, indent: true })
  if (b.crypto > 0) items.push({ label: '暗号資産・FX等', value: b.crypto })
  if (b.rishi > 0) items.push({ label: '利子所得', value: b.rishi })

  if (items.length === 0) return null

  const grossTotal = b.salary + b.bonus + b.jigyoRevenue + b.fudosanRevenue + b.haito + b.kabuGain + b.crypto + b.rishi

  return (
    <>
      <tr>
        <td
          colSpan={2}
          className="border border-gray-200 px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-800"
        >
          【収入内訳】
        </td>
      </tr>
      {items.map((item, i) => (
        <tr key={i} className="hover:bg-gray-50">
          <td className="border border-gray-200 px-4 py-2 text-gray-700">{item.label}</td>
          <td
            className={`border border-gray-200 px-4 py-2 text-right font-mono ${
              item.value < 0 ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {fmt(item.value)}
          </td>
        </tr>
      ))}
      <tr>
        <td className="border border-gray-200 px-4 py-2 text-gray-700 font-medium">総収入合計</td>
        <td className="border border-gray-200 px-4 py-2 text-right font-mono font-semibold text-gray-900">
          {fmt(grossTotal)}
        </td>
      </tr>
      <tr>
        <td colSpan={2} className="border border-gray-200 px-4 py-0">
          <hr className="border-gray-300" />
        </td>
      </tr>
    </>
  )
}

export function ResultPanel({ result }: ResultPanelProps) {
  const showJisshitsu = result.totalTsumitate > 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SummaryCard
          label="推定手取り額"
          sublabel="（税・社保控除後）"
          value={result.tedori}
          monthly={result.tedoriMonthly}
          color="blue"
        />
        {showJisshitsu && (
          <SummaryCard
            label="実質手取り額"
            sublabel="（積立控除後）"
            value={result.tedoriJisshitsu}
            monthly={result.tedoriJisshitsuMonthly}
            color="green"
          />
        )}
      </div>

      {showJisshitsu && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          積立合計：{fmt(result.totalTsumitate)} 円（iDeCo・小規模企業共済）を差し引いた可処分所得です。
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SmallCard label="総収入" value={result.grossIncome} />
        <SmallCard label="課税所得" value={result.taxableIncome} />
        <SmallCard label="所得税" value={result.totalSogoTax} />
        <SmallCard label="分離課税" value={result.bunriTax} />
        <SmallCard label="住民税（概算）" value={result.juminTax} />
        <SmallCard label="社会保険料" value={result.shakai} />
        {result.jigyoZei > 0 && <SmallCard label="事業税" value={result.jigyoZei} />}
      </div>

      <div className="overflow-x-auto">
        <p className="text-sm font-semibold text-gray-800 mb-2">計算内訳</p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left text-xs font-semibold text-gray-800">
                項目
              </th>
              <th className="border border-gray-200 px-4 py-2 text-right text-xs font-semibold text-gray-800">
                金額（円）
              </th>
            </tr>
          </thead>
          <tbody>
            <GrossBreakdownSection b={result.grossBreakdown} />
            {BREAKDOWN_ROWS.map(row => {
              const raw = result[row.key] as number
              return (
                <tr key={row.label} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 text-gray-700">{row.label}</td>
                  <td
                    className={`border border-gray-200 px-4 py-2 text-right font-mono ${
                      row.negative ? 'text-gray-900' : raw < 0 ? 'text-red-600' : 'text-gray-900'
                    }`}
                  >
                    {row.negative ? `▲ ${fmt(raw)}` : fmt(raw)}
                  </td>
                </tr>
              )
            })}
            {result.jigyoZei > 0 && (
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2 text-gray-700">事業税</td>
                <td className="border border-gray-200 px-4 py-2 text-right font-mono text-gray-900">
                  {fmt(result.jigyoZei)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-relaxed space-y-1">
        <p>
          本ツールは概算です。実際の税額は確定申告・年末調整によります。
          必ず国税庁または税理士にご確認ください。
        </p>
        {result.jigyoZei > 0 && (
          <p>事業税は翌年分の所得控除対象です（本ツールでは簡略化のため未反映）。</p>
        )}
      </div>
    </div>
  )
}
