'use client'

import { useState } from 'react'
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
  subLabel,
  subValue,
}: {
  label: string
  value: number
  subLabel?: string
  subValue?: number
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-700 mb-1">{label}</p>
      <p className="font-bold text-lg text-gray-900">
        {fmt(value)}{' '}
        <span className="text-xs font-normal text-gray-700">円</span>
      </p>
      {subLabel != null && subValue != null && (
        <p className="text-xs text-gray-500 mt-1">
          {subLabel}:{' '}
          <span className="font-semibold text-gray-700">{fmt(subValue)}</span>{' '}
          円
        </p>
      )}
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

function SeparatorRow() {
  return (
    <tr>
      <td colSpan={2} className="border border-gray-200 px-4 py-0">
        <hr className="border-gray-300" />
      </td>
    </tr>
  )
}

function GrossBreakdownSection({
  b,
  grossAfterExpense,
}: {
  b: TedoriResult['grossBreakdown']
  grossAfterExpense: number
}) {
  const grossTotal = b.salary + b.bonus + b.jigyoRevenue + b.fudosanRevenue + b.haito + b.kabuGain + b.crypto + b.rishi
  if (grossTotal === 0) return null

  const salaryTotal = b.salary + b.bonus
  const totalExpense = b.jigyoExpense + b.fudosanExpense
  const hasJigyo = b.jigyoRevenue > 0 || b.jigyoShotoku !== 0
  const hasFudosan = b.fudosanRevenue > 0 || b.fudosanShotoku !== 0

  return (
    <>
      <tr>
        <td colSpan={2} className="border border-gray-200 px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-800">
          【収入内訳】
        </td>
      </tr>

      {salaryTotal > 0 && (
        <>
          <tr className="hover:bg-gray-50">
            <td className="border border-gray-200 px-4 py-2 text-gray-700">給与収入（月次合計）</td>
            <td className="border border-gray-200 px-4 py-2 text-right font-mono text-gray-900">{fmt(salaryTotal)}</td>
          </tr>
          {b.bonus > 0 && (
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-2 text-gray-500">　うち賞与</td>
              <td className="border border-gray-200 px-4 py-2 text-right font-mono text-gray-700">{fmt(b.bonus)}</td>
            </tr>
          )}
        </>
      )}

      {hasJigyo && (
        <>
          {b.jigyoRevenue > 0 && (
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-2 text-gray-700">事業売上合計</td>
              <td className="border border-gray-200 px-4 py-2 text-right font-mono text-gray-900">{fmt(b.jigyoRevenue)}</td>
            </tr>
          )}
          {b.jigyoExpense > 0 && (
            <>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2 text-gray-500">　経費</td>
                <td className="border border-gray-200 px-4 py-2 text-right font-mono text-red-600">△ {fmt(b.jigyoExpense)}</td>
              </tr>
              <SeparatorRow />
            </>
          )}
          <tr className="hover:bg-gray-50">
            <td className="border border-gray-200 px-4 py-2 text-gray-500">　事業所得</td>
            <td className="border border-gray-200 px-4 py-2 text-right font-mono text-blue-600 font-semibold">{fmt(b.jigyoShotoku)}</td>
          </tr>
        </>
      )}

      {hasFudosan && (
        <>
          {b.fudosanRevenue > 0 && (
            <tr className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-2 text-gray-700">不動産収入合計</td>
              <td className="border border-gray-200 px-4 py-2 text-right font-mono text-gray-900">{fmt(b.fudosanRevenue)}</td>
            </tr>
          )}
          {b.fudosanExpense > 0 && (
            <>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2 text-gray-500">　経費</td>
                <td className="border border-gray-200 px-4 py-2 text-right font-mono text-red-600">△ {fmt(b.fudosanExpense)}</td>
              </tr>
              <SeparatorRow />
            </>
          )}
          <tr className="hover:bg-gray-50">
            <td className="border border-gray-200 px-4 py-2 text-gray-500">　不動産所得</td>
            <td className="border border-gray-200 px-4 py-2 text-right font-mono text-blue-600 font-semibold">{fmt(b.fudosanShotoku)}</td>
          </tr>
        </>
      )}

      {b.haito > 0 && (
        <tr className="hover:bg-gray-50">
          <td className="border border-gray-200 px-4 py-2 text-gray-700">配当所得</td>
          <td className="border border-gray-200 px-4 py-2 text-right font-mono text-gray-900">{fmt(b.haito)}</td>
        </tr>
      )}
      {b.kabuGain > 0 && (
        <tr className="hover:bg-gray-50">
          <td className="border border-gray-200 px-4 py-2 text-gray-700">株式売却益</td>
          <td className="border border-gray-200 px-4 py-2 text-right font-mono text-gray-900">{fmt(b.kabuGain)}</td>
        </tr>
      )}
      {b.kabuLoss > 0 && (
        <tr className="hover:bg-gray-50">
          <td className="border border-gray-200 px-4 py-2 text-gray-500">　うち株式売却損</td>
          <td className="border border-gray-200 px-4 py-2 text-right font-mono text-gray-700">{fmt(b.kabuLoss)}</td>
        </tr>
      )}
      {b.crypto > 0 && (
        <tr className="hover:bg-gray-50">
          <td className="border border-gray-200 px-4 py-2 text-gray-700">暗号資産・FX等</td>
          <td className="border border-gray-200 px-4 py-2 text-right font-mono text-gray-900">{fmt(b.crypto)}</td>
        </tr>
      )}
      {b.rishi > 0 && (
        <tr className="hover:bg-gray-50">
          <td className="border border-gray-200 px-4 py-2 text-gray-700">利子所得</td>
          <td className="border border-gray-200 px-4 py-2 text-right font-mono text-gray-900">{fmt(b.rishi)}</td>
        </tr>
      )}

      <tr>
        <td className="border border-gray-200 px-4 py-2 text-gray-700 font-medium">総収入合計</td>
        <td className="border border-gray-200 px-4 py-2 text-right font-mono font-semibold text-gray-900">{fmt(grossTotal)}</td>
      </tr>
      {totalExpense > 0 && (
        <tr>
          <td className="border border-gray-200 px-4 py-2 text-gray-700 font-medium">経費控除後総収入</td>
          <td className="border border-gray-200 px-4 py-2 text-right font-mono font-semibold text-blue-600">{fmt(grossAfterExpense)}</td>
        </tr>
      )}

      <SeparatorRow />
    </>
  )
}

function FormulaBox({ result }: { result: TedoriResult }) {
  const [open, setOpen] = useState(true)
  const showJisshitsu = result.totalTsumitate > 0
  const hasExpense = result.totalExpense > 0

  const rows: { label: string; value: number }[] = [
    { label: '所得税（復興税込）', value: result.totalSogoTax },
    { label: '住民税', value: result.juminTax },
    { label: '社会保険料', value: result.shakai },
    { label: '事業税', value: result.jigyoZei },
    { label: '分離課税（株式・配当）', value: result.bunriTax },
  ].filter(r => r.value > 0)

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-800">推定手取り額の計算式</p>
        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {open ? '計算式を隠す' : '計算式を表示'}
        </button>
      </div>
      {open && (
        <div className="px-4 py-3 text-sm">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-1 text-gray-700">{hasExpense ? '総収入（売上合計）' : '総収入'}</td>
                <td className="py-1 text-right font-mono text-gray-900">{fmt(result.grossIncome)} 円</td>
              </tr>
              {hasExpense && (
                <>
                  <tr>
                    <td className="py-1 text-gray-600">ー 事業経費・不動産経費</td>
                    <td className="py-1 text-right font-mono text-gray-700">{fmt(result.totalExpense)} 円</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="py-0">
                      <hr className="border-gray-300" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-700">経費控除後収入</td>
                    <td className="py-1 text-right font-mono text-gray-900">{fmt(result.grossAfterExpense)} 円</td>
                  </tr>
                </>
              )}
              {rows.map(r => (
                <tr key={r.label}>
                  <td className="py-1 text-gray-600">ー {r.label}</td>
                  <td className="py-1 text-right font-mono text-gray-700">{fmt(r.value)} 円</td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} className="py-1">
                  <hr className="border-gray-400 border-t-2" />
                </td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-gray-800">推定手取り額</td>
                <td className="py-1 text-right font-mono font-semibold text-blue-700">{fmt(result.tedori)} 円</td>
              </tr>
              {showJisshitsu && (
                <>
                  <tr>
                    <td colSpan={2} className="pt-3 pb-1">
                      <hr className="border-gray-200" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">ー iDeCo・小規模企業共済</td>
                    <td className="py-1 text-right font-mono text-gray-700">{fmt(result.totalTsumitate)} 円</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="py-1">
                      <hr className="border-gray-400 border-t-2" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-gray-800">実質手取り額</td>
                    <td className="py-1 text-right font-mono font-semibold text-green-700">{fmt(result.tedoriJisshitsu)} 円</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
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

      <FormulaBox result={result} />

      {showJisshitsu && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          積立合計：{fmt(result.totalTsumitate)} 円（iDeCo・小規模企業共済）を差し引いた可処分所得です。
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SmallCard
          label="総収入"
          value={result.grossIncome}
          subLabel={result.totalExpense > 0 ? '経費控除後' : undefined}
          subValue={result.totalExpense > 0 ? result.grossAfterExpense : undefined}
        />
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
            <GrossBreakdownSection b={result.grossBreakdown} grossAfterExpense={result.grossAfterExpense} />
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
