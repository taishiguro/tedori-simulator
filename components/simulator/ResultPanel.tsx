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
  value,
  highlight,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-lg border p-4 shadow-sm ${
        highlight
          ? 'bg-blue-600 border-blue-700 text-white'
          : 'bg-white border-gray-200 text-gray-900'
      }`}
    >
      <p className={`text-xs mb-1 ${highlight ? 'text-blue-200' : 'text-gray-500'}`}>{label}</p>
      <p className={`font-bold text-lg ${highlight ? 'text-white' : 'text-gray-900'}`}>
        {fmt(value)}{' '}
        <span className={`text-xs font-normal ${highlight ? 'text-blue-200' : 'text-gray-500'}`}>
          円
        </span>
      </p>
    </div>
  )
}

const BREAKDOWN_ROWS: { label: string; key: keyof TedoriResult; negative?: boolean }[] = [
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

export function ResultPanel({ result }: ResultPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="総収入" value={result.grossIncome} />
        <SummaryCard label="課税所得" value={result.taxableIncome} />
        <SummaryCard label="所得税" value={result.totalSogoTax} />
        <SummaryCard label="分離課税" value={result.bunriTax} />
        <SummaryCard label="住民税（概算）" value={result.juminTax} />
        <SummaryCard label="社会保険料" value={result.shakai} />
        <SummaryCard label="手取り年額" value={result.tedori} highlight />
        <SummaryCard label="手取り月額" value={result.tedoriMonthly} highlight />
      </div>

      <div className="overflow-x-auto">
        <p className="text-sm font-semibold text-gray-700 mb-2">計算内訳</p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left text-xs font-semibold text-gray-600">
                項目
              </th>
              <th className="border border-gray-200 px-4 py-2 text-right text-xs font-semibold text-gray-600">
                金額（円）
              </th>
            </tr>
          </thead>
          <tbody>
            {BREAKDOWN_ROWS.map(row => {
              const raw = result[row.key]
              const display = row.negative ? -raw : raw
              return (
                <tr key={row.label} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 text-gray-700">{row.label}</td>
                  <td
                    className={`border border-gray-200 px-4 py-2 text-right font-mono ${
                      display < 0 ? 'text-red-600' : 'text-gray-900'
                    }`}
                  >
                    {row.negative ? `▲ ${fmt(raw)}` : fmt(raw)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-relaxed">
        本ツールは概算です。実際の税額は確定申告・年末調整によります。
        <br />
        必ず国税庁または税理士にご確認ください。
      </div>
    </div>
  )
}
