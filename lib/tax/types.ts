export interface TaxBracket {
  min: number
  max: number | null
  rate: number
  deduction: number
}

export interface TaxData {
  year: number
  label: string
  version: string
  incomeTax: {
    brackets: TaxBracket[]
    fukkoRate: number
  }
  socialInsurance: {
    employee: {
      prefRates: Record<string, number>
      nenkinRate: number
      koyoRate: number
      hyohjunHoshu: {
        min: number
        max: number
      }
    }
    self: {
      kokuhoRate: number
      kokunenAnnual: number
    }
  }
  deductions: {
    basic: {
      default: number
      incomeThresholds: Array<{
        limit: number
        amount: number
      }>
    }
    kyuyo: Array<{
      min: number
      max: number | null
      rate: number
      offset: number
    }>
    taishoku: {
      ratePerYear: number
      ratePerYearOver20: number
      baseOver20: number
      minAmount: number
    }
    seimei: {
      maxPerCategory: number
      totalMax: number
    }
    kasai: {
      max: number
    }
  }
}

export interface SimulatorInputs {
  salary: number
  bonus: number
  jigyoRevenue: number[]
  jigyoExpense: number[]
  fudosanRevenue: number[]
  fudosanExpense: number[]
  haito: number
  haitoMode: 'bunri' | 'sogo' | 'noapply'
  kabuGain: number
  kabuLoss: number
  crypto: number
  rishi: number
  taishoku: number
  kinzoku: number
  koyo: 'employee' | 'self' | 'none'
  // 1: 第1種事業（5%）小売・製造・飲食等, 2: 第2種事業（4%）畜産・水産・薪炭
  // 3a: 第3種事業（5%）医師・弁護士等, 3b: 第3種事業（3%）あん摩・はり等
  jigyoCategory: '1' | '2' | '3a' | '3b'
  pref: string
  deductions: {
    basic: boolean
    spouse: boolean
    spouseIncome: number
    spouseSpecial: boolean
    spouseSpecialIncome: number
    dependGeneral: number
    dependTokutei: number
    dependRojin: number
    disableGeneral: number
    disableSpecial: number
    disableTogether: number
    widow: boolean
    widowType: number
    student: boolean
    aoshiro: boolean
    aoshiroAmount: number
    ideco: number
    shoukibo: number
    medical: number
    seimeiLife: number
    seimeiKaigo: number
    seimeiNenkin: number
    kasai: number
    furusato: number
    jutaku: boolean
    loanBalance: number
    loanRate: number
  }
}

export interface TedoriResult {
  grossIncome: number
  kyuyoShotoku: number
  kyuyoKojo: number
  jigyoShotoku: number
  sogoIncome: number
  taxableIncome: number
  sogoTax: number
  fukkoTax: number
  totalSogoTax: number
  bunriTax: number
  juminTax: number
  shakai: number
  jigyoZei: number
  totalTax: number
  tedori: number
  tedoriMonthly: number
  totalTsumitate: number
  tedoriJisshitsu: number
  tedoriJisshitsuMonthly: number
  grossBreakdown: {
    salary: number
    bonus: number
    jigyoRevenue: number
    jigyoExpense: number
    jigyoShotoku: number
    fudosanRevenue: number
    fudosanExpense: number
    fudosanShotoku: number
    haito: number
    kabuGain: number
    kabuLoss: number
    crypto: number
    rishi: number
  }
}
