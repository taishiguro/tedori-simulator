'use client'

import { useState } from 'react'
import { MonthlyGrid } from './MonthlyGrid'

export interface InvestState {
  haito: number
  haitoMode: 'bunri' | 'sogo' | 'noapply'
  kabuGain: number
  kabuLoss: number
  fudosanRevenue: number[]
  fudosanExpense: number[]
  fudosanDepreciation: number
  fudosanRepair: number
  fudosanManagement: number
  crypto: number
  rishi: number
}

interface InvestInputProps {
  state: InvestState
  onChange: (patch: Partial<InvestState>) => void
}

function fmt(n: number) {
  return n.toLocaleString('ja-JP')
}

function NumInput({
  label,
  value,
  onChange,
  note,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  note?: string
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <label className="text-sm font-medium text-gray-800 sm:w-52 shrink-0">
        {label}
        {note && <span className="ml-1 text-xs text-gray-700">（{note}）</span>}
      </label>
      <input
        type="number"
        value={value === 0 ? '' : value}
        onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
        min={0}
        step="1"
        placeholder="0"
        className="rounded border border-gray-300 px-3 py-1.5 text-sm text-right text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-44"
      />
      <span className="text-xs text-gray-700 hidden sm:inline">円</span>
    </div>
  )
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

export function InvestInput({ state, onChange }: InvestInputProps) {
  const {
    haito, haitoMode, kabuGain, kabuLoss,
    fudosanRevenue, fudosanExpense,
    fudosanDepreciation, fudosanRepair, fudosanManagement,
    crypto, rishi,
  } = state

  const fudosanRevTotal = fudosanRevenue.reduce((a, b) => a + b, 0)
  const fudosanExpTotal = fudosanExpense.reduce((a, b) => a + b, 0)
  const fudosanShotoku = fudosanRevTotal - fudosanExpTotal

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">配当所得</h3>
        <NumInput
          label="配当所得（年間）"
          value={haito}
          onChange={v => onChange({ haito: v })}
          note="円"
        />
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <span className="text-sm font-medium text-gray-800 sm:w-52 shrink-0">申告方法</span>
          <div className="flex flex-wrap gap-4">
            {([['bunri', '申告分離課税'], ['sogo', '総合課税'], ['noapply', '申告不要']] as const).map(([mode, label]) => (
              <label key={mode} className="flex items-center gap-1 text-sm text-gray-900 cursor-pointer">
                <input
                  type="radio"
                  name="haitoMode"
                  value={mode}
                  checked={haitoMode === mode}
                  onChange={() => onChange({ haitoMode: mode })}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">株式・投信売却</h3>
        <NumInput
          label="売却益（年間）"
          value={kabuGain}
          onChange={v => onChange({ kabuGain: v })}
          note="円"
        />
        <NumInput
          label="損失繰越控除額"
          value={kabuLoss}
          onChange={v => onChange({ kabuLoss: v })}
          note="円"
        />
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">不動産所得（月次・円）</h3>
        <p className="text-xs text-gray-700">赤字の場合はマイナス入力可</p>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-800">家賃収入</p>
          <BulkInput
            placeholder="月額均等入力（円）"
            onApply={v => onChange({ fudosanRevenue: Array(12).fill(v) })}
            onClear={() => onChange({ fudosanRevenue: Array(12).fill(0) })}
          />
          <MonthlyGrid
            values={fudosanRevenue}
            onChange={v => onChange({ fudosanRevenue: v })}
            allowNegative
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-800">経費</p>
          <BulkInput
            placeholder="月額均等入力（円）"
            onApply={v => onChange({ fudosanExpense: Array(12).fill(v) })}
            onClear={() => onChange({ fudosanExpense: Array(12).fill(0) })}
          />
          <MonthlyGrid
            values={fudosanExpense}
            onChange={v => onChange({ fudosanExpense: v })}
          />
        </div>

        <div className="rounded bg-gray-50 px-4 py-2 text-sm text-gray-800 space-y-1">
          <div className="flex gap-4">
            <span>家賃収入合計: <span className="font-semibold">{fmt(fudosanRevTotal)}</span> 円</span>
            <span>経費合計: <span className="font-semibold">{fmt(fudosanExpTotal)}</span> 円</span>
          </div>
          <div className={`font-semibold ${fudosanShotoku < 0 ? 'text-red-600' : 'text-blue-700'}`}>
            所得合計: {fmt(fudosanShotoku)} 円
            {fudosanShotoku < 0 && <span className="ml-2 text-red-600">（赤字）</span>}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-800">経費内訳メモ（任意）</p>
          <NumInput
            label="減価償却費"
            value={fudosanDepreciation}
            onChange={v => onChange({ fudosanDepreciation: v })}
          />
          <NumInput
            label="修繕費"
            value={fudosanRepair}
            onChange={v => onChange({ fudosanRepair: v })}
          />
          <NumInput
            label="管理費・委託費"
            value={fudosanManagement}
            onChange={v => onChange({ fudosanManagement: v })}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">その他所得</h3>
        <NumInput
          label="暗号資産・FX等 雑所得（年間）"
          value={crypto}
          onChange={v => onChange({ crypto: v })}
          note="円"
        />
        <NumInput
          label="利子所得（年間）"
          value={rishi}
          onChange={v => onChange({ rishi: v })}
          note="円"
        />
      </section>
    </div>
  )
}
