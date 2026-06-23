import type { InvestState } from '@/components/simulator/InvestInput'
import type { SimulatorInputs, TedoriResult } from '@/lib/tax/types'

export interface CsvExportData {
  year: number
  date: string
  koyo: SimulatorInputs['koyo']
  pref: string
  salaryMonthly: number[]
  bonus: number
  jigyoRevenue: number[]
  jigyoExpense: number[]
  invest: InvestState
  deductions: SimulatorInputs['deductions']
  result: TedoriResult
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function generateCsvContent(data: CsvExportData): string {
  const rows: string[] = []
  const { deductions: d, invest, result } = data

  rows.push('手取りシミュレーター出力データ')
  rows.push(`meta:year,${data.year}`)
  rows.push(`meta:date,${data.date}`)
  rows.push(`meta:version,1.0.0`)

  rows.push(`input:koyo,${data.koyo}`)
  rows.push(`input:pref,${data.pref}`)

  data.salaryMonthly.forEach((v, i) => rows.push(`input:salary_${pad2(i + 1)},${v}`))
  rows.push(`input:bonus,${data.bonus}`)
  data.jigyoRevenue.forEach((v, i) => rows.push(`input:jigyo_revenue_${pad2(i + 1)},${v}`))
  data.jigyoExpense.forEach((v, i) => rows.push(`input:jigyo_expense_${pad2(i + 1)},${v}`))

  rows.push(`input:kabu_gain,${invest.kabuGain}`)
  rows.push(`input:kabu_loss,${invest.kabuLoss}`)
  rows.push(`input:haito_amt,${invest.haito}`)
  rows.push(`input:haito_mode,${invest.haitoMode}`)
  invest.fudosanRevenue.forEach((v, i) => rows.push(`input:fudosan_revenue_${pad2(i + 1)},${v}`))
  invest.fudosanExpense.forEach((v, i) => rows.push(`input:fudosan_expense_${pad2(i + 1)},${v}`))
  rows.push(`input:crypto,${invest.crypto}`)
  rows.push(`input:rishi,${invest.rishi}`)

  rows.push(`input:deduction_basic,${d.basic}`)
  rows.push(`input:deduction_spouse,${d.spouse}`)
  rows.push(`input:deduction_spouse_income,${d.spouseIncome}`)
  rows.push(`input:deduction_spouse_special,${d.spouseSpecial}`)
  rows.push(`input:deduction_spouse_special_income,${d.spouseSpecialIncome}`)
  rows.push(`input:deduction_depend_general,${d.dependGeneral}`)
  rows.push(`input:deduction_depend_tokutei,${d.dependTokutei}`)
  rows.push(`input:deduction_depend_rojin,${d.dependRojin}`)
  rows.push(`input:deduction_disable_general,${d.disableGeneral}`)
  rows.push(`input:deduction_disable_special,${d.disableSpecial}`)
  rows.push(`input:deduction_disable_together,${d.disableTogether}`)
  rows.push(`input:deduction_widow,${d.widow}`)
  rows.push(`input:deduction_widow_type,${d.widowType}`)
  rows.push(`input:deduction_student,${d.student}`)
  rows.push(`input:deduction_aoshiro,${d.aoshiro}`)
  rows.push(`input:deduction_aoshiro_amount,${d.aoshiroAmount}`)
  rows.push(`input:deduction_ideco,${d.ideco}`)
  rows.push(`input:deduction_shoukibo,${d.shoukibo}`)
  rows.push(`input:deduction_medical,${d.medical}`)
  rows.push(`input:deduction_seimei_life,${d.seimeiLife}`)
  rows.push(`input:deduction_seimei_kaigo,${d.seimeiKaigo}`)
  rows.push(`input:deduction_seimei_nenkin,${d.seimeiNenkin}`)
  rows.push(`input:deduction_kasai,${d.kasai}`)
  rows.push(`input:deduction_furusato,${d.furusato}`)
  rows.push(`input:deduction_jutaku,${d.jutaku}`)
  rows.push(`input:deduction_loan_balance,${d.loanBalance}`)
  rows.push(`input:deduction_loan_rate,${d.loanRate}`)

  rows.push(`result:gross_income,${result.grossIncome}`)
  rows.push(`result:taxable_income,${result.taxableIncome}`)
  rows.push(`result:income_tax,${result.totalSogoTax}`)
  rows.push(`result:jumin_tax,${result.juminTax}`)
  rows.push(`result:shakai,${result.shakai}`)
  rows.push(`result:tedori,${result.tedori}`)
  rows.push(`result:tedori_monthly,${result.tedoriMonthly}`)

  return rows.join('\n')
}

export function downloadCsv(data: CsvExportData): void {
  const bom = '﻿'
  const content = bom + generateCsvContent(data)
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tedori-keisan-${data.date}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
