'use client'

import { useState } from 'react'

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

interface JigyoInputProps {
  revenue: number[]
  expense: number[]
  onRevenueChange: (monthly: number[]) => void
  onExpenseChange: (monthly: number[]) => void
}

function fmt(n: number) {
  return n.toLocaleString('ja-JP')
}

function BulkInput({
  placeholder,
  onApply,
  onClear,
}: {
  placeholder: string
  onApply: (v: number) => void
  onClear: () => void
}) {
  const [val, setVal] = useState('')
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder={placeholder}
        step="1"
        className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
      />
      <button
        type="button"
        onClick={() => { const v = parseInt(val.replace(/,/g, ''), 10); if (!isNaN(v)) { onApply(v); setVal('') } }}
        className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 transition-colors"
      >
        12ヶ月に展開
      </button>
      <button
        type="button"
        onClick={() => { onClear(); setVal('') }}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        クリア
      </button>
    </div>
  )
}

function HalfYearGrid({
  startIdx,
  revenue,
  expense,
  onRevenueChange,
  onExpenseChange,
}: {
  startIdx: number
  revenue: number[]
  expense: number[]
  onRevenueChange: (idx: number, val: string) => void
  onExpenseChange: (idx: number, val: string) => void
}) {
  const indices = [0, 1, 2, 3, 4, 5].map(i => startIdx + i)

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[380px] grid grid-cols-7 gap-x-2 gap-y-1.5 items-center">
        {/* Header */}
        <div />
        {indices.map(i => (
          <div key={i} className="text-center text-xs font-medium text-gray-800">{MONTHS[i]}</div>
        ))}

        {/* Revenue row */}
        <div className="text-xs font-medium text-gray-800 whitespace-nowrap">売上</div>
        {indices.map(i => (
          <input
            key={i}
            type="number"
            value={revenue[i] === 0 ? '' : revenue[i]}
            onChange={e => onRevenueChange(i, e.target.value)}
            step="1"
            placeholder="0"
            className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs text-right text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ))}

        {/* Expense row */}
        <div className="text-xs font-medium text-gray-800 whitespace-nowrap">経費</div>
        {indices.map(i => (
          <input
            key={i}
            type="number"
            value={expense[i] === 0 ? '' : expense[i]}
            onChange={e => onExpenseChange(i, e.target.value)}
            min={0}
            step="1"
            placeholder="0"
            className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs text-right text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ))}

        {/* Income row (auto-calculated) */}
        <div className="text-xs font-medium text-gray-800 whitespace-nowrap">所得</div>
        {indices.map(i => {
          const income = revenue[i] - expense[i]
          return (
            <div
              key={i}
              className={`text-xs text-right font-medium ${income < 0 ? 'text-red-600' : 'text-blue-700'}`}
            >
              {fmt(income)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function JigyoInput({ revenue, expense, onRevenueChange, onExpenseChange }: JigyoInputProps) {
  const handleRevenueCell = (idx: number, raw: string) => {
    const n = parseInt(raw, 10)
    const next = [...revenue]
    next[idx] = isNaN(n) ? 0 : n
    onRevenueChange(next)
  }

  const handleExpenseCell = (idx: number, raw: string) => {
    const n = parseInt(raw, 10)
    const next = [...expense]
    next[idx] = isNaN(n) ? 0 : n
    onExpenseChange(next)
  }

  const revTotal = revenue.reduce((a, b) => a + b, 0)
  const expTotal = expense.reduce((a, b) => a + b, 0)
  const incomeTotal = revTotal - expTotal

  return (
    <div className="space-y-5">
      <p className="text-xs text-gray-700">赤字の場合はマイナス入力可（経費は正の値で入力）</p>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-800">売上の月額均等入力</p>
        <BulkInput
          placeholder="売上 月額均等（円）"
          onApply={v => onRevenueChange(Array(12).fill(v))}
          onClear={() => onRevenueChange(Array(12).fill(0))}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-800">経費の月額均等入力</p>
        <BulkInput
          placeholder="経費 月額均等（円）"
          onApply={v => onExpenseChange(Array(12).fill(v))}
          onClear={() => onExpenseChange(Array(12).fill(0))}
        />
      </div>

      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-800">月次入力（円）</p>

        <div className="space-y-1">
          <p className="text-xs text-gray-700 font-medium">1〜6月</p>
          <HalfYearGrid
            startIdx={0}
            revenue={revenue}
            expense={expense}
            onRevenueChange={handleRevenueCell}
            onExpenseChange={handleExpenseCell}
          />
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-700 font-medium">7〜12月</p>
          <HalfYearGrid
            startIdx={6}
            revenue={revenue}
            expense={expense}
            onRevenueChange={handleRevenueCell}
            onExpenseChange={handleExpenseCell}
          />
        </div>
      </div>

      <div className="rounded bg-blue-50 px-4 py-3 text-sm space-y-1">
        <div className="flex flex-wrap gap-4 text-gray-800">
          <span>売上合計: <span className="font-semibold text-gray-900">{fmt(revTotal)}</span> 円</span>
          <span>経費合計: <span className="font-semibold text-gray-900">{fmt(expTotal)}</span> 円</span>
        </div>
        <div className={`font-semibold ${incomeTotal < 0 ? 'text-red-600' : 'text-blue-800'}`}>
          所得合計: {fmt(incomeTotal)} 円
          {incomeTotal < 0 && <span className="ml-2">（赤字）</span>}
          <span className="ml-1 text-xs font-normal text-gray-700">※青色申告特別控除前</span>
        </div>
      </div>
    </div>
  )
}
