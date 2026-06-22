'use client'

import { useState } from 'react'
import { MonthlyGrid } from './MonthlyGrid'

interface SalaryInputProps {
  monthly: number[]
  bonus: number
  onChange: (monthly: number[], bonus: number) => void
}

function fmt(n: number) {
  return n.toLocaleString('ja-JP')
}

export function SalaryInput({ monthly, bonus, onChange }: SalaryInputProps) {
  const [bulkValue, setBulkValue] = useState('')
  const yearTotal = monthly.reduce((a, b) => a + b, 0) + bonus

  const handleBulk = () => {
    const v = parseInt(bulkValue.replace(/,/g, ''), 10)
    if (!isNaN(v) && v >= 0) {
      onChange(Array(12).fill(v), bonus)
    }
  }

  const handleClear = () => {
    onChange(Array(12).fill(0), 0)
    setBulkValue('')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          value={bulkValue}
          onChange={e => setBulkValue(e.target.value)}
          placeholder="月額均等入力（円）"
          min={0}
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
        <p className="mb-2 text-sm font-semibold text-gray-700">月次給与（円）</p>
        <MonthlyGrid values={monthly} onChange={v => onChange(v, bonus)} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">賞与（年間・円）</label>
        <input
          type="number"
          value={bonus === 0 ? '' : bonus}
          onChange={e => onChange(monthly, parseInt(e.target.value, 10) || 0)}
          min={0}
          step="1"
          placeholder="0"
          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
        />
      </div>

      <div className="rounded bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
        年計: {fmt(yearTotal)} 円
      </div>
    </div>
  )
}
