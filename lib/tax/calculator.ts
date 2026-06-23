import { TaxData, SimulatorInputs, TedoriResult } from './types'

/**
 * 給与所得控除額を計算する
 * 所得税法第28条・給与所得控除額速算表
 */
export function calcKyuyoKojo(salary: number, data: TaxData): number {
  const table = data.deductions.kyuyo
  for (const row of table) {
    if (row.max === null || salary <= row.max) {
      const raw = Math.round(salary * row.rate) + row.offset
      return Math.max(0, raw)
    }
  }
  return 0
}

/**
 * 所得税額（復興特別所得税含む）を計算する
 * 所得税法第89条・復興特別所得税法第13条
 */
export function calcIncomeTax(taxableIncome: number, data: TaxData): number {
  if (taxableIncome <= 0) return 0
  const { brackets, fukkoRate } = data.incomeTax
  let base = 0
  for (const b of brackets) {
    if (b.max === null || taxableIncome <= b.max) {
      base = Math.round(taxableIncome * b.rate - b.deduction)
      break
    }
  }
  if (base < 0) base = 0
  return Math.round(base * (1 + fukkoRate))
}

/**
 * 社会保険料合計を計算する
 * 健康保険法・厚生年金保険法
 */
export function calcSocialInsurance(
  salary: number,
  pref: string,
  koyo: string,
  data: TaxData
): number {
  if (koyo === 'none') return 0

  if (koyo === 'self') {
    const kokuho = Math.round(salary * data.socialInsurance.self.kokuhoRate)
    return kokuho + data.socialInsurance.self.kokunenAnnual
  }

  // employee: 標準報酬月額は月額ベースで計算し、年額に換算
  const emp = data.socialInsurance.employee
  const monthlyBase = Math.round(salary / 12)
  const hoshu = Math.min(Math.max(monthlyBase, emp.hyohjunHoshu.min), emp.hyohjunHoshu.max)
  const kenkoRate = (emp.prefRates[pref] ?? emp.prefRates['13']) / 100
  const kenkoHoken = Math.round(hoshu * kenkoRate) * 12
  const nenkin = Math.round(hoshu * emp.nenkinRate) * 12
  const koyoHoken = Math.round(salary * emp.koyoRate)
  return kenkoHoken + nenkin + koyoHoken
}

/**
 * 全所得控除の合計を計算する
 */
export function calcAllDeductions(
  inputs: SimulatorInputs,
  sogoIncome: number,
  shakai: number,
  data: TaxData
): number {
  let total = 0

  // 社会保険料控除
  total += shakai

  // 基礎控除
  if (inputs.deductions.basic) {
    const thresholds = data.deductions.basic.incomeThresholds
    for (const t of thresholds) {
      if (t.limit === null || sogoIncome <= t.limit) {
        total += t.amount
        break
      }
    }
  }

  // 配偶者控除・配偶者特別控除（簡易実装: 38万円固定）
  if (inputs.deductions.spouse) {
    total += 380000
  } else if (inputs.deductions.spouseSpecial && inputs.deductions.spouseSpecialIncome > 0) {
    total += 380000
  }

  // 扶養控除
  total += inputs.deductions.dependGeneral * 380000
  total += inputs.deductions.dependTokutei * 630000
  total += inputs.deductions.dependRojin * 480000

  // 障害者控除
  total += inputs.deductions.disableGeneral * 270000
  total += inputs.deductions.disableSpecial * 400000
  total += inputs.deductions.disableTogether * 750000

  // ひとり親・寡婦控除
  if (inputs.deductions.widow) {
    total += inputs.deductions.widowType === 1 ? 350000 : 270000
  }

  // 勤労学生控除
  if (inputs.deductions.student) total += 270000

  // 小規模企業共済等掛金控除（iDeCo + 小規模企業共済）
  total += inputs.deductions.ideco + inputs.deductions.shoukibo

  // 医療費控除
  const medicalDeduction = inputs.deductions.medical - Math.min(Math.round(sogoIncome * 0.05), 100000)
  if (medicalDeduction > 0) total += medicalDeduction

  // 生命保険料控除
  const { maxPerCategory, totalMax } = data.deductions.seimei
  const seimeiLife = Math.min(inputs.deductions.seimeiLife, maxPerCategory)
  const seimeiKaigo = Math.min(inputs.deductions.seimeiKaigo, maxPerCategory)
  const seimeiNenkin = Math.min(inputs.deductions.seimeiNenkin, maxPerCategory)
  total += Math.min(seimeiLife + seimeiKaigo + seimeiNenkin, totalMax)

  // 地震保険料控除
  total += Math.min(inputs.deductions.kasai, data.deductions.kasai.max)

  // ふるさと納税（寄附金控除）: 2000円超の部分
  const furusatoDeduction = inputs.deductions.furusato - 2000
  if (furusatoDeduction > 0) total += furusatoDeduction

  // 住宅借入金等特別控除（税額控除のため控除額として0、後段で税額から引く）
  // 住宅ローン控除は税額控除なのでここでは加算しない

  return Math.round(total)
}

/**
 * 個人事業税を計算する
 * 課税対象 = 事業所得 - 事業主控除（290万円）
 * 地方税法第72条の2・第72条の49の9
 * @param jigyoShotoku 事業所得
 * @param category 業種区分
 */
export function calcJigyoZei(
  jigyoShotoku: number,
  category: '1' | '2' | '3a' | '3b'
): number {
  const taxable = Math.max(0, jigyoShotoku - 2900000)
  const rates: Record<string, number> = { '1': 0.05, '2': 0.04, '3a': 0.05, '3b': 0.03 }
  return Math.round(taxable * rates[category])
}

/**
 * 全収入・控除を受け取り手取り額を返すメイン関数
 */
export function calcTedori(inputs: SimulatorInputs, data: TaxData): TedoriResult {
  // 給与所得
  const kyuyoBase = inputs.salary + inputs.bonus
  const kyuyoKojo = calcKyuyoKojo(kyuyoBase, data)
  const kyuyoShotoku = Math.round(Math.max(0, kyuyoBase - kyuyoKojo))

  // 事業所得（青色申告特別控除をここで控除）
  const aoshiroKojo = inputs.deductions.aoshiro ? inputs.deductions.aoshiroAmount : 0
  const jigyoRevTotal = inputs.jigyoRevenue.reduce((a, b) => a + b, 0)
  const jigyoExpTotal = inputs.jigyoExpense.reduce((a, b) => a + b, 0)
  const jigyoShotoku = Math.round(jigyoRevTotal - jigyoExpTotal - aoshiroKojo)

  // 不動産所得
  const fudosanRevTotal = inputs.fudosanRevenue.reduce((a, b) => a + b, 0)
  const fudosanExpTotal = inputs.fudosanExpense.reduce((a, b) => a + b, 0)
  const fudosanShotoku = Math.round(fudosanRevTotal - fudosanExpTotal)

  // 総合課税所得（配当は選択による）
  const haitoSogo = inputs.haitoMode === 'sogo' ? inputs.haito : 0
  const sogoIncome = Math.round(kyuyoShotoku + jigyoShotoku + fudosanShotoku + haitoSogo + inputs.crypto + inputs.rishi)

  // 社会保険料
  const shakai = calcSocialInsurance(kyuyoBase, inputs.pref, inputs.koyo, data)

  // 所得控除合計
  const allDeductions = calcAllDeductions(inputs, sogoIncome, shakai, data)

  // 課税総所得金額（1000円未満切り捨て）
  const taxableIncome = Math.max(0, Math.floor((sogoIncome - allDeductions) / 1000) * 1000)

  // 所得税（復興特別所得税含む）
  const totalSogoTax = calcIncomeTax(taxableIncome, data)

  // 復興特別所得税のみ分離
  const { fukkoRate } = data.incomeTax
  const sogoTax = Math.round(totalSogoTax / (1 + fukkoRate))
  const fukkoTax = totalSogoTax - sogoTax

  // 住宅ローン控除（税額控除）
  let jutakuCredit = 0
  if (inputs.deductions.jutaku && inputs.deductions.loanBalance > 0) {
    jutakuCredit = Math.round(inputs.deductions.loanBalance * inputs.deductions.loanRate)
  }
  const sogoTaxAfterCredit = Math.max(0, totalSogoTax - jutakuCredit)

  // 分離課税（株式譲渡・配当分離）
  const kabuNet = Math.max(0, inputs.kabuGain - inputs.kabuLoss)
  const haitoBunri = inputs.haitoMode === 'bunri' ? inputs.haito : 0
  const bunriBase = kabuNet + haitoBunri
  const bunriTax = Math.round(bunriBase * 0.20315)

  // 住民税（簡易: 総合課税所得の10% - 住宅ローン控除）
  const juminTax = Math.max(0, Math.round(taxableIncome * 0.10) - jutakuCredit)

  // 事業所得がある場合は雇用形態に関わらず事業税を計算
  const jigyoZei = jigyoShotoku > 0
    ? calcJigyoZei(jigyoShotoku, inputs.jigyoCategory)
    : 0

  // 合計税負担
  const totalTax = Math.round(sogoTaxAfterCredit + bunriTax + juminTax + shakai + jigyoZei)

  // 総収入
  const grossIncome = Math.round(inputs.salary + inputs.bonus + jigyoRevTotal + fudosanRevTotal + inputs.haito + inputs.kabuGain + inputs.crypto + inputs.rishi)
  const totalExpense = jigyoExpTotal + fudosanExpTotal
  const grossAfterExpense = Math.round(grossIncome - totalExpense)

  // 手取り（経費は実際の支出のため grossAfterExpense から控除）
  const tedori = Math.round(grossAfterExpense - totalTax)
  const tedoriMonthly = Math.round(tedori / 12)

  // 実質手取り（iDeCo・小規模企業共済の積立控除後）
  const totalTsumitate = inputs.deductions.ideco + inputs.deductions.shoukibo
  const tedoriJisshitsu = tedori - totalTsumitate
  const tedoriJisshitsuMonthly = Math.round(tedoriJisshitsu / 12)

  return {
    grossIncome,
    kyuyoShotoku,
    kyuyoKojo,
    jigyoShotoku,
    sogoIncome,
    taxableIncome,
    sogoTax,
    fukkoTax,
    totalSogoTax: sogoTaxAfterCredit,
    bunriTax,
    juminTax,
    shakai,
    jigyoZei,
    totalTax,
    tedori,
    tedoriMonthly,
    totalTsumitate,
    tedoriJisshitsu,
    tedoriJisshitsuMonthly,
    grossAfterExpense,
    totalExpense,
    grossBreakdown: {
      salary: inputs.salary,
      bonus: inputs.bonus,
      jigyoRevenue: jigyoRevTotal,
      jigyoExpense: jigyoExpTotal,
      jigyoShotoku,
      fudosanRevenue: fudosanRevTotal,
      fudosanExpense: fudosanExpTotal,
      fudosanShotoku,
      haito: inputs.haito,
      kabuGain: inputs.kabuGain,
      kabuLoss: inputs.kabuLoss,
      crypto: inputs.crypto,
      rishi: inputs.rishi,
    },
  }
}

/**
 * ふるさと納税の上限額（目安）を計算する
 * 上限額 = （住民税所得割額 × 20%）÷（1 - 所得税率 - 住民税率10%）+ 2,000円
 * 住民税所得割額 = 課税所得 × 10%
 */
export function calcFurusatoLimit(taxableIncome: number, data: TaxData): number {
  if (taxableIncome <= 0) return 2000

  const juminshozei = taxableIncome * 0.10

  let incomeTaxRate = 0
  for (const b of data.incomeTax.brackets) {
    if (b.max === null || taxableIncome <= b.max) {
      incomeTaxRate = b.rate
      break
    }
  }

  const denominator = 1 - incomeTaxRate - 0.10
  if (denominator <= 0) return 2000

  return Math.round((juminshozei * 0.20) / denominator) + 2000
}
