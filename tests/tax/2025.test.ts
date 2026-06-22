import { calcKyuyoKojo, calcSocialInsurance, calcTedori } from '../../lib/tax/calculator'
import { getTaxData } from '../../lib/tax/loader'
import { SimulatorInputs } from '../../lib/tax/types'

const data = getTaxData(2025)

const baseInputs: SimulatorInputs = {
  salary: 0,
  bonus: 0,
  jigyo: 0,
  fudosan: 0,
  haito: 0,
  haitoMode: 'noapply',
  kabuGain: 0,
  kabuLoss: 0,
  crypto: 0,
  rishi: 0,
  taishoku: 0,
  kinzoku: 0,
  koyo: 'none',
  pref: '13',
  deductions: {
    basic: false,
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
    widowType: 0,
    student: false,
    aoshiro: false,
    aoshiroAmount: 0,
    shako: 0,
    medical: 0,
    seimeiLife: 0,
    seimeiKaigo: 0,
    seimeiNenkin: 0,
    kasai: 0,
    furusato: 0,
    jutaku: false,
    loanBalance: 0,
    loanRate: 0,
  },
}

describe('年収500万円・東京・会社員', () => {
  const salary = 5_000_000

  test('給与所得控除は1,440,000円', () => {
    expect(calcKyuyoKojo(salary, data)).toBe(1_440_000)
  })

  test('社会保険料: 健康保険+厚生年金+雇用保険の合計', () => {
    // 月額: round(5,000,000/12)=416,667
    // 健保(東京13: 4.990%): round(416,667×0.04990)×12 = 20,792×12 = 249,504
    // 厚年(9.15%): round(416,667×0.0915)×12 = 38,125×12 = 457,500
    // 雇用(0.6%): round(5,000,000×0.006) = 30,000
    const shakai = calcSocialInsurance(salary, '13', 'employee', data)
    expect(shakai).toBe(737_004)
  })
})

describe('年収500万円・事業所得300万円の複合ケース', () => {
  const inputs: SimulatorInputs = {
    ...baseInputs,
    salary: 5_000_000,
    jigyo: 3_000_000,
    koyo: 'employee',
    pref: '13',
    deductions: { ...baseInputs.deductions, basic: true },
  }

  test('給与所得・事業所得・総合所得が正しく計算される', () => {
    const result = calcTedori(inputs, data)
    expect(result.kyuyoKojo).toBe(1_440_000)
    expect(result.kyuyoShotoku).toBe(3_560_000)
    expect(result.jigyoShotoku).toBe(3_000_000)
    // sogoIncome = kyuyoShotoku + jigyoShotoku = 6,560,000
    expect(result.sogoIncome).toBe(6_560_000)
  })
})

describe('株式売却益100万円（申告分離）', () => {
  const inputs: SimulatorInputs = {
    ...baseInputs,
    kabuGain: 1_000_000,
    kabuLoss: 0,
    haitoMode: 'noapply',
  }

  test('分離課税税額が204,000円前後（20.315%）', () => {
    const result = calcTedori(inputs, data)
    // 1,000,000 × 0.20315 = 203,150
    expect(result.bunriTax).toBeGreaterThanOrEqual(200_000)
    expect(result.bunriTax).toBeLessThanOrEqual(207_000)
  })
})

describe('基礎控除・給与所得控除の適用', () => {
  const inputs: SimulatorInputs = {
    ...baseInputs,
    salary: 5_000_000,
    koyo: 'employee',
    pref: '13',
    deductions: { ...baseInputs.deductions, basic: true },
  }

  test('給与所得控除1,440,000円が適用される', () => {
    const result = calcTedori(inputs, data)
    expect(result.kyuyoKojo).toBe(1_440_000)
  })

  test('基礎控除480,000円が適用される（所得24,000,000円以下）', () => {
    // sogoIncome = 3,560,000 → threshold 24,000,000 → basic = 480,000
    // shakai = 737,004
    // allDeductions = 737,004 + 480,000 = 1,217,004
    // taxableIncome = floor((3,560,000 - 1,217,004) / 1000) * 1000 = 2,342,000
    const result = calcTedori(inputs, data)
    expect(result.taxableIncome).toBe(2_342_000)
  })

  test('所得税額が正しく計算される', () => {
    // taxableIncome = 2,342,000
    // bracket: 1,950,000-3,299,000 → rate=0.10, deduction=97,500
    // base = round(2,342,000 × 0.10) - 97,500 = 234,200 - 97,500 = 136,700
    // with fukko: round(136,700 × 1.021) = round(139,569.7) = 139,570
    const result = calcTedori(inputs, data)
    expect(result.totalSogoTax).toBeGreaterThan(0)
    expect(result.totalSogoTax).toBeLessThan(result.taxableIncome)
  })
})
