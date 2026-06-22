'use client'

import { useState, useMemo } from 'react'
import { SimulatorInputs } from '@/lib/tax/types'
import { calcTedori } from '@/lib/tax/calculator'
import { getTaxData } from '@/lib/tax/loader'
import { SalaryInput } from '@/components/simulator/SalaryInput'
import { JigyoInput } from '@/components/simulator/JigyoInput'
import { InvestInput, type InvestState } from '@/components/simulator/InvestInput'
import { DeductionInput } from '@/components/simulator/DeductionInput'
import { ResultPanel } from '@/components/simulator/ResultPanel'

const PREFS = [
  { code: '1', name: '北海道' }, { code: '2', name: '青森県' }, { code: '3', name: '岩手県' },
  { code: '4', name: '宮城県' }, { code: '5', name: '秋田県' }, { code: '6', name: '山形県' },
  { code: '7', name: '福島県' }, { code: '8', name: '茨城県' }, { code: '9', name: '栃木県' },
  { code: '10', name: '群馬県' }, { code: '11', name: '埼玉県' }, { code: '12', name: '千葉県' },
  { code: '13', name: '東京都' }, { code: '14', name: '神奈川県' }, { code: '15', name: '新潟県' },
  { code: '16', name: '富山県' }, { code: '17', name: '石川県' }, { code: '18', name: '福井県' },
  { code: '19', name: '山梨県' }, { code: '20', name: '長野県' }, { code: '21', name: '岐阜県' },
  { code: '22', name: '静岡県' }, { code: '23', name: '愛知県' }, { code: '24', name: '三重県' },
  { code: '25', name: '滋賀県' }, { code: '26', name: '京都府' }, { code: '27', name: '大阪府' },
  { code: '28', name: '兵庫県' }, { code: '29', name: '奈良県' }, { code: '30', name: '和歌山県' },
  { code: '31', name: '鳥取県' }, { code: '32', name: '島根県' }, { code: '33', name: '岡山県' },
  { code: '34', name: '広島県' }, { code: '35', name: '山口県' }, { code: '36', name: '徳島県' },
  { code: '37', name: '香川県' }, { code: '38', name: '愛媛県' }, { code: '39', name: '高知県' },
  { code: '40', name: '福岡県' }, { code: '41', name: '佐賀県' }, { code: '42', name: '長崎県' },
  { code: '43', name: '熊本県' }, { code: '44', name: '大分県' }, { code: '45', name: '宮崎県' },
  { code: '46', name: '鹿児島県' }, { code: '47', name: '沖縄県' },
]

const TABS = [
  { id: 'salary', label: '①給与所得' },
  { id: 'jigyo', label: '②事業所得' },
  { id: 'invest', label: '③投資所得' },
  { id: 'deduct', label: '④控除' },
  { id: 'result', label: '⑤計算結果' },
] as const

type TabId = (typeof TABS)[number]['id']

const DEFAULT_DEDUCTIONS: SimulatorInputs['deductions'] = {
  basic: true,
  spouse: false,
  spouseIncome: 0,
  spouseSpecial: false,
  spouseSpecialIncome: 0,
  dependGeneral: 0,
  dependTokutei: 0,
  dependRojin: 0,
  disableGeneral: 0,
  disableSpecial: 0,
  disableTogether: 0,
  widow: false,
  widowType: 1,
  student: false,
  aoshiro: false,
  aoshiroAmount: 650000,
  shako: 0,
  medical: 0,
  seimeiLife: 0,
  seimeiKaigo: 0,
  seimeiNenkin: 0,
  kasai: 0,
  furusato: 0,
  jutaku: false,
  loanBalance: 0,
  loanRate: 0.007,
}

const DEFAULT_INVEST: InvestState = {
  haito: 0,
  haitoMode: 'noapply',
  kabuGain: 0,
  kabuLoss: 0,
  fudosanMonthly: Array(12).fill(0) as number[],
  crypto: 0,
  rishi: 0,
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('salary')
  const [koyo, setKoyo] = useState<SimulatorInputs['koyo']>('employee')
  const [pref, setPref] = useState('13')
  const [salaryMonthly, setSalaryMonthly] = useState<number[]>(Array(12).fill(0))
  const [bonus, setBonus] = useState(0)
  const [jigyoMonthly, setJigyoMonthly] = useState<number[]>(Array(12).fill(0))
  const [invest, setInvest] = useState<InvestState>(DEFAULT_INVEST)
  const [deductions, setDeductions] = useState<SimulatorInputs['deductions']>(DEFAULT_DEDUCTIONS)

  const taxData = useMemo(() => getTaxData(2025), [])

  const inputs: SimulatorInputs = useMemo(
    () => ({
      salary: salaryMonthly.reduce((a, b) => a + b, 0),
      bonus,
      jigyo: jigyoMonthly.reduce((a, b) => a + b, 0),
      fudosan: invest.fudosanMonthly.reduce((a, b) => a + b, 0),
      haito: invest.haito,
      haitoMode: invest.haitoMode,
      kabuGain: invest.kabuGain,
      kabuLoss: invest.kabuLoss,
      crypto: invest.crypto,
      rishi: invest.rishi,
      taishoku: 0,
      kinzoku: 0,
      koyo,
      pref,
      deductions,
    }),
    [salaryMonthly, bonus, jigyoMonthly, invest, koyo, pref, deductions]
  )

  const result = useMemo(() => calcTedori(inputs, taxData), [inputs, taxData])

  const handleInvestChange = (patch: Partial<InvestState>) => {
    setInvest(prev => ({ ...prev, ...patch }))
  }

  const handleSalaryChange = (monthly: number[], b: number) => {
    setSalaryMonthly(monthly)
    setBonus(b)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">手取りシミュレーター</h1>
        <p className="text-xs text-gray-700">令和7年（2025年）税制対応</p>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <nav className="flex overflow-x-auto gap-1 mb-4 pb-1 scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          {activeTab === 'salary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">雇用形態</p>
                  <div className="flex flex-wrap gap-4">
                    {(
                      [
                        ['employee', '会社員'],
                        ['self', '自営業'],
                        ['none', '未加入'],
                      ] as const
                    ).map(([val, label]) => (
                      <label key={val} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-900">
                        <input
                          type="radio"
                          name="koyo"
                          value={val}
                          checked={koyo === val}
                          onChange={() => setKoyo(val)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                {koyo !== 'none' && (
                  <div>
                    <label
                      htmlFor="pref"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      都道府県（健康保険料率）
                    </label>
                    <select
                      id="pref"
                      value={pref}
                      onChange={e => setPref(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PREFS.map(p => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <SalaryInput
                monthly={salaryMonthly}
                bonus={bonus}
                onChange={handleSalaryChange}
              />
            </div>
          )}

          {activeTab === 'jigyo' && (
            <JigyoInput monthly={jigyoMonthly} onChange={setJigyoMonthly} />
          )}

          {activeTab === 'invest' && (
            <InvestInput state={invest} onChange={handleInvestChange} />
          )}

          {activeTab === 'deduct' && (
            <DeductionInput deductions={deductions} onChange={setDeductions} />
          )}

          {activeTab === 'result' && <ResultPanel result={result} />}
        </div>
      </main>
    </div>
  )
}
