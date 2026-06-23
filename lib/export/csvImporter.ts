import type { InvestState } from '@/components/simulator/InvestInput'
import type { SimulatorInputs } from '@/lib/tax/types'

export interface ImportedState {
  year: number
  koyo: SimulatorInputs['koyo']
  jigyoCategory: SimulatorInputs['jigyoCategory']
  pref: string
  salaryMonthly: number[]
  bonus: number
  jigyoRevenue: number[]
  jigyoExpense: number[]
  invest: InvestState
  deductions: SimulatorInputs['deductions']
}

export function parseCsv(text: string): ImportedState {
  const content = text.startsWith('﻿') ? text.slice(1) : text
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean)

  const map: Record<string, string> = {}
  for (const line of lines) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const rest = line.slice(colonIdx + 1)
    const commaIdx = rest.indexOf(',')
    if (commaIdx === -1) continue
    const key = line.slice(0, colonIdx) + ':' + rest.slice(0, commaIdx)
    map[key] = rest.slice(commaIdx + 1)
  }

  const year = parseInt(map['meta:year'] ?? '0', 10)
  if (!year) {
    throw new Error('手取りシミュレーターの出力CSVではありません')
  }
  if (year !== 2025) {
    throw new Error(`対応していない年度のデータです（${year}年分）`)
  }

  const num = (k: string) => parseInt(map[k] ?? '0', 10) || 0
  const flt = (k: string) => parseFloat(map[k] ?? '0') || 0
  const bool = (k: string) => map[k] === 'true'
  const pad2 = (n: number) => String(n).padStart(2, '0')
  const monthly12 = (prefix: string) =>
    Array.from({ length: 12 }, (_, i) => num(`${prefix}_${pad2(i + 1)}`))

  const koyoRaw = map['input:koyo'] ?? 'employee'
  const koyo: SimulatorInputs['koyo'] =
    koyoRaw === 'employee' || koyoRaw === 'self' || koyoRaw === 'none'
      ? koyoRaw
      : 'employee'

  const jigyoCategoryRaw = map['input:jigyo_category'] ?? '1'
  const jigyoCategory: SimulatorInputs['jigyoCategory'] =
    jigyoCategoryRaw === '1' || jigyoCategoryRaw === '2' || jigyoCategoryRaw === '3a' || jigyoCategoryRaw === '3b'
      ? jigyoCategoryRaw
      : '1'

  const haitoModeRaw = map['input:haito_mode'] ?? 'noapply'
  const haitoMode: InvestState['haitoMode'] =
    haitoModeRaw === 'bunri' || haitoModeRaw === 'sogo' || haitoModeRaw === 'noapply'
      ? haitoModeRaw
      : 'noapply'

  return {
    year,
    koyo,
    jigyoCategory,
    pref: map['input:pref'] ?? '13',
    salaryMonthly: monthly12('input:salary'),
    bonus: num('input:bonus'),
    jigyoRevenue: monthly12('input:jigyo_revenue'),
    jigyoExpense: monthly12('input:jigyo_expense'),
    invest: {
      haito: num('input:haito_amt'),
      haitoMode,
      kabuGain: num('input:kabu_gain'),
      kabuLoss: num('input:kabu_loss'),
      fudosanRevenue: monthly12('input:fudosan_revenue'),
      fudosanExpense: monthly12('input:fudosan_expense'),
      fudosanDepreciation: 0,
      fudosanRepair: 0,
      fudosanManagement: 0,
      crypto: num('input:crypto'),
      rishi: num('input:rishi'),
    },
    deductions: {
      basic: bool('input:deduction_basic'),
      spouse: bool('input:deduction_spouse'),
      spouseIncome: num('input:deduction_spouse_income'),
      spouseSpecial: bool('input:deduction_spouse_special'),
      spouseSpecialIncome: num('input:deduction_spouse_special_income'),
      dependGeneral: num('input:deduction_depend_general'),
      dependTokutei: num('input:deduction_depend_tokutei'),
      dependRojin: num('input:deduction_depend_rojin'),
      disableGeneral: num('input:deduction_disable_general'),
      disableSpecial: num('input:deduction_disable_special'),
      disableTogether: num('input:deduction_disable_together'),
      widow: bool('input:deduction_widow'),
      widowType: num('input:deduction_widow_type') || 1,
      student: bool('input:deduction_student'),
      aoshiro: bool('input:deduction_aoshiro'),
      aoshiroAmount: num('input:deduction_aoshiro_amount') || 650000,
      ideco: num('input:deduction_ideco'),
      shoukibo: num('input:deduction_shoukibo'),
      medical: num('input:deduction_medical'),
      seimeiLife: num('input:deduction_seimei_life'),
      seimeiKaigo: num('input:deduction_seimei_kaigo'),
      seimeiNenkin: num('input:deduction_seimei_nenkin'),
      kasai: num('input:deduction_kasai'),
      furusato: num('input:deduction_furusato'),
      jutaku: bool('input:deduction_jutaku'),
      loanBalance: num('input:deduction_loan_balance'),
      loanRate: flt('input:deduction_loan_rate') || 0.007,
    },
  }
}
