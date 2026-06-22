'use client'

import { useState } from 'react'
import { MonthlyGrid } from './MonthlyGrid'

interface JigyoInputProps {
  monthly: number[]
  onChange: (monthly: number[]) => void
}

function fmt(n: number) {
  return n.toLocaleString('ja-JP')
}

export function JigyoInput({ monthly, onChange }: JigyoInputProps) {
  const [bulkValue, setBulkValue] = useState('')
  const yearTotal = monthly.reduce((a, b) => a + b, 0)

  const handleBulk = () => {
    const v = parseInt(bulkValue.replace(/,/g, ''), 10)
    if (!isNaN(v)) {
      onChange(Array(12).fill(v))
    }
  }

  const handleClear = () => {
    onChange(Array(12).fill(0))
    setBulkValue('')
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">赤字の場合はマイナス入力可</p>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          value={bulkValue}
          onChange={e => setBulkValue(e.target.value)}
          placeholder="月額均等入力（円）"
          step="1"
          className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
        />
        <button
          type="button"
          onClick={handleBulk}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 transition-colors"
        >
          12ヶ月に展開
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          クリア
        </button>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-gray-700">月次事業所得（円）</p>
        <MonthlyGrid values={monthly} onChange={onChange} allowNegative />
      </div>

      <div className="rounded bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
        年計: {fmt(yearTotal)} 円
        {yearTotal < 0 && <span className="ml-2 text-red-600">（赤字）</span>}
      </div>
    </div>
  )
}
