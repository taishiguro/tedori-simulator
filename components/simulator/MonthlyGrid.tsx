'use client'

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

interface MonthlyGridProps {
  values: number[]
  onChange: (values: number[]) => void
  allowNegative?: boolean
}

export function MonthlyGrid({ values, onChange, allowNegative = false }: MonthlyGridProps) {
  const handleChange = (idx: number, raw: string) => {
    const n = parseInt(raw, 10)
    const next = [...values]
    next[idx] = isNaN(n) ? 0 : n
    onChange(next)
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {MONTHS.map((month, i) => (
        <div key={month} className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">{month}</label>
          <input
            type="number"
            value={values[i] === 0 ? '' : values[i]}
            onChange={e => handleChange(i, e.target.value)}
            min={allowNegative ? undefined : 0}
            step="1"
            placeholder="0"
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      ))}
    </div>
  )
}
