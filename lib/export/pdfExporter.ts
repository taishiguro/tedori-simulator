import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import type { InvestState } from '@/components/simulator/InvestInput'
import type { SimulatorInputs, TedoriResult } from '@/lib/tax/types'

export interface PdfExportData {
  year: number
  date: string
  koyo: SimulatorInputs['koyo']
  pref: string
  salaryMonthly: number[]
  bonus: number
  jigyoMonthly: number[]
  invest: InvestState
  deductions: SimulatorInputs['deductions']
  result: TedoriResult
}

function fmt(n: number): string {
  return n.toLocaleString('ja-JP')
}

// jspdf-autotable adds lastAutoTable to the jsPDF instance at runtime,
// but the type declaration does not reflect this augmentation.
function lastFinalY(doc: jsPDF, fallback: number): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (doc as any).lastAutoTable?.finalY ?? fallback
}

export function downloadPdf(data: PdfExportData): void {
  const doc = new jsPDF()
  const { result } = data

  doc.setFontSize(16)
  doc.text('Tedori Simulator Result', 14, 18)

  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  doc.text(`Tax Year: ${data.year} (Reiwa 7)  |  Date: ${data.date}`, 14, 26)

  doc.setFontSize(8)
  doc.setTextColor(160, 100, 0)
  doc.text(
    [
      'Disclaimer: This tool provides estimates only. Actual tax may differ.',
      'Consult the NTA or a tax professional for accurate figures.',
      '(本ツールは概算です。実際の税額は確定申告・年末調整によります。)',
      '(必ず国税庁または税理士にご確認ください。)',
    ],
    14,
    34,
  )

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.text('Summary', 14, 58)

  autoTable(doc, {
    startY: 62,
    head: [['Item', 'Amount (JPY)']],
    body: [
      ['Total Income (総収入)', fmt(result.grossIncome)],
      ['Taxable Income (課税所得)', fmt(result.taxableIncome)],
      ['Income Tax (所得税)', fmt(result.totalSogoTax)],
      ['Separate Tax (分離課税)', fmt(result.bunriTax)],
      ['Resident Tax (住民税)', fmt(result.juminTax)],
      ['Social Insurance (社会保険料)', fmt(result.shakai)],
      ['Total Tax + Insurance (税・社保合計)', fmt(result.totalTax)],
      ['Annual Take-Home (手取り年額)', fmt(result.tedori)],
      ['Monthly Take-Home (手取り月額)', fmt(result.tedoriMonthly)],
    ],
    headStyles: { fillColor: [37, 99, 235] },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    columnStyles: { 1: { halign: 'right' } },
  })

  const summaryFinalY = lastFinalY(doc, 62)

  doc.setFontSize(11)
  doc.text('Breakdown', 14, summaryFinalY + 12)

  autoTable(doc, {
    startY: summaryFinalY + 16,
    head: [['Item', 'Amount (JPY)']],
    body: [
      ['Salary Income (給与所得)', fmt(result.kyuyoShotoku)],
      ['  Salary Deduction (給与所得控除)', `▲ ${fmt(result.kyuyoKojo)}`],
      ['Business Income (事業所得)', fmt(result.jigyoShotoku)],
      ['Total Gross Income (総合課税所得)', fmt(result.sogoIncome)],
      ['Taxable Income (課税所得)', fmt(result.taxableIncome)],
      ['Income Tax Base (所得税基準額)', fmt(result.sogoTax)],
      ['Reconstruction Tax (復興特別所得税)', fmt(result.fukkoTax)],
      ['Income Tax Total (所得税合計)', fmt(result.totalSogoTax)],
      ['Separate Tax (分離課税)', fmt(result.bunriTax)],
      ['Resident Tax (住民税)', fmt(result.juminTax)],
      ['Social Insurance (社会保険料)', fmt(result.shakai)],
      ['Total Tax + Insurance (税・社保合計)', fmt(result.totalTax)],
    ],
    headStyles: { fillColor: [100, 116, 139] },
    columnStyles: { 1: { halign: 'right' } },
  })

  doc.save(`tedori-keisan-${data.date}.pdf`)
}
