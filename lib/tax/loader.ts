import data2025 from '@/data/tax/2025.json'
import { TaxData } from './types'

const TAX_DATA: Record<number, TaxData> = {
  2025: data2025 as TaxData,
}

export const SUPPORTED_YEARS = [2025]
export const DEFAULT_YEAR = 2025

export function getTaxData(year: number = DEFAULT_YEAR): TaxData {
  const data = TAX_DATA[year]
  if (!data) throw new Error(`Tax data for ${year} is not available`)
  return data
}
