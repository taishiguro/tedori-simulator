'use client'

import { MonthlyGrid } from './MonthlyGrid'

export interface InvestState {
  haito: number
  haitoMode: 'bunri' | 'sogo' | 'noapply'
  kabuGain: number
  kabuLoss: number
  fudosanMonthly: number[]
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
      <label className="text-sm font-medium text-gray-700 sm:w-52 shrink-0">
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
        className="rounded border border-gray-300 px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-44"
      />
      <span className="text-xs text-gray-700 hidden sm:inline">円</span>
    </div>
  )
}

export function InvestInput({ state, onChange }: InvestInputProps) {
  const { haito, haitoMode, kabuGain, kabuLoss, fudosanMonthly, crypto, rishi } = state
  const fudosanTotal = fudosanMonthly.reduce((a, b) => a + b, 0)

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
          <span className="text-sm font-medium text-gray-700 sm:w-52 shrink-0">申告方法</span>
          <div className="flex flex-wrap gap-4">
            {([['bunri', '申告分離課税'], ['sogo', '総合課税'], ['noapply', '申告不要']] as const).map(([mode, label]) => (
              <label key={mode} className="flex items-center gap-1 text-sm cursor-pointer">
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
        <MonthlyGrid
          values={fudosanMonthly}
          onChange={v => onChange({ fudosanMonthly: v })}
          allowNegative
        />
        <div className="rounded bg-gray-50 px-4 py-2 text-sm text-gray-700">
          年計: {fmt(fudosanTotal)} 円
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
