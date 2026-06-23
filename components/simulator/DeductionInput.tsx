'use client'

import { useState } from 'react'
import { SimulatorInputs } from '@/lib/tax/types'

type Deductions = SimulatorInputs['deductions']

interface DeductionInputProps {
  deductions: Deductions
  onChange: (d: Deductions) => void
  furusatoLimit: number
}

function NumInput({
  label,
  value,
  onChange,
  unit = '円',
}: {
  label: string
  value: number
  onChange: (v: number) => void
  unit?: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 ml-6">
      <label className="text-sm text-gray-800 w-52">{label}</label>
      <input
        type="number"
        value={value === 0 ? '' : value}
        onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
        min={0}
        step="1"
        placeholder="0"
        className="rounded border border-gray-300 px-2 py-1 text-sm text-right text-gray-900 w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <span className="text-xs text-gray-700">{unit}</span>
    </div>
  )
}

function CountInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 ml-6">
      <label className="text-sm text-gray-800 w-52">{label}</label>
      <input
        type="number"
        value={value === 0 ? '' : value}
        onChange={e => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
        min={0}
        step="1"
        placeholder="0"
        className="rounded border border-gray-300 px-2 py-1 text-sm text-right text-gray-900 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <span className="text-xs text-gray-700">人</span>
    </div>
  )
}

function Checkbox({
  label,
  checked,
  onChange,
  note,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  note?: string
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm font-medium text-gray-900">{label}</span>
      {note && <span className="text-xs text-gray-700">（{note}）</span>}
    </label>
  )
}

export function DeductionInput({ deductions, onChange, furusatoLimit }: DeductionInputProps) {
  const [idecoOpen, setIdecoOpen] = useState(deductions.ideco > 0)
  const [shoukiboOpen, setShoukiboOpen] = useState(deductions.shoukibo > 0)
  const [furusatoOpen, setFurusatoOpen] = useState(deductions.furusato > 0)

  const set = <K extends keyof Deductions>(key: K, value: Deductions[K]) => {
    onChange({ ...deductions, [key]: value } as Deductions)
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">人的控除</h3>

        <Checkbox
          label="基礎控除"
          checked={deductions.basic}
          onChange={v => set('basic', v)}
          note="最大48万円"
        />

        <Checkbox
          label="配偶者控除"
          checked={deductions.spouse}
          onChange={v => set('spouse', v)}
        />
        {deductions.spouse && (
          <NumInput
            label="配偶者の合計所得"
            value={deductions.spouseIncome}
            onChange={v => set('spouseIncome', v)}
          />
        )}

        <Checkbox
          label="配偶者特別控除"
          checked={deductions.spouseSpecial}
          onChange={v => set('spouseSpecial', v)}
        />
        {deductions.spouseSpecial && (
          <NumInput
            label="配偶者の合計所得"
            value={deductions.spouseSpecialIncome}
            onChange={v => set('spouseSpecialIncome', v)}
          />
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-800">扶養控除</p>
          <CountInput
            label="一般扶養（16〜18歳・23〜69歳）"
            value={deductions.dependGeneral}
            onChange={v => set('dependGeneral', v)}
          />
          <CountInput
            label="特定扶養（19〜22歳）"
            value={deductions.dependTokutei}
            onChange={v => set('dependTokutei', v)}
          />
          <CountInput
            label="老人扶養（70歳以上）"
            value={deductions.dependRojin}
            onChange={v => set('dependRojin', v)}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-800">障害者控除</p>
          <CountInput
            label="一般障害者"
            value={deductions.disableGeneral}
            onChange={v => set('disableGeneral', v)}
          />
          <CountInput
            label="特別障害者"
            value={deductions.disableSpecial}
            onChange={v => set('disableSpecial', v)}
          />
          <CountInput
            label="同居特別障害者"
            value={deductions.disableTogether}
            onChange={v => set('disableTogether', v)}
          />
        </div>

        <Checkbox
          label="ひとり親・寡婦控除"
          checked={deductions.widow}
          onChange={v => set('widow', v)}
        />
        {deductions.widow && (
          <div className="flex flex-wrap gap-4 ml-6">
            <label className="flex items-center gap-1 text-sm text-gray-900 cursor-pointer">
              <input
                type="radio"
                name="widowType"
                checked={deductions.widowType === 1}
                onChange={() => set('widowType', 1)}
              />
              ひとり親（35万円）
            </label>
            <label className="flex items-center gap-1 text-sm text-gray-900 cursor-pointer">
              <input
                type="radio"
                name="widowType"
                checked={deductions.widowType === 2}
                onChange={() => set('widowType', 2)}
              />
              寡婦（27万円）
            </label>
          </div>
        )}

        <Checkbox
          label="勤労学生控除"
          checked={deductions.student}
          onChange={v => set('student', v)}
          note="27万円"
        />
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">支出・積立控除</h3>

        <Checkbox
          label="青色申告特別控除"
          checked={deductions.aoshiro}
          onChange={v => set('aoshiro', v)}
        />
        {deductions.aoshiro && (
          <div className="flex flex-wrap gap-4 ml-6">
            {([
              [650000, '65万円（e-Tax）'],
              [550000, '55万円'],
              [100000, '10万円'],
            ] as const).map(([amount, label]) => (
              <label key={amount} className="flex items-center gap-1 text-sm text-gray-900 cursor-pointer">
                <input
                  type="radio"
                  name="aoshiroAmount"
                  checked={deductions.aoshiroAmount === amount}
                  onChange={() => set('aoshiroAmount', amount)}
                />
                {label}
              </label>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Checkbox
            label="iDeCo（個人型確定拠出年金）"
            checked={idecoOpen}
            onChange={v => {
              setIdecoOpen(v)
              if (!v) set('ideco', 0)
            }}
          />
          {idecoOpen && (
            <div className="ml-6 space-y-1">
              <NumInput
                label="掛金額（年間）"
                value={deductions.ideco}
                onChange={v => set('ideco', v)}
              />
              <p className="text-xs text-gray-500 ml-0">上限の目安: 会社員 年276,000円 / 自営業 年816,000円</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Checkbox
            label="小規模企業共済"
            checked={shoukiboOpen}
            onChange={v => {
              setShoukiboOpen(v)
              if (!v) set('shoukibo', 0)
            }}
          />
          {shoukiboOpen && (
            <div className="ml-6 space-y-1">
              <NumInput
                label="掛金額（年間）"
                value={deductions.shoukibo}
                onChange={v => set('shoukibo', v)}
              />
              <p className="text-xs text-gray-500 ml-0">上限: 月70,000円（年840,000円）</p>
            </div>
          )}
        </div>

        {(idecoOpen || shoukiboOpen) && (
          <p className="text-xs text-gray-600 ml-1">
            iDeCo + 小規模企業共済 = 合計{(deductions.ideco + deductions.shoukibo).toLocaleString('ja-JP')}円（全額所得控除）
          </p>
        )}
        <NumInput
          label="医療費控除（実支出額）"
          value={deductions.medical}
          onChange={v => set('medical', v)}
        />
        <NumInput
          label="生命保険料（一般）"
          value={deductions.seimeiLife}
          onChange={v => set('seimeiLife', v)}
        />
        <NumInput
          label="生命保険料（介護医療）"
          value={deductions.seimeiKaigo}
          onChange={v => set('seimeiKaigo', v)}
        />
        <NumInput
          label="生命保険料（個人年金）"
          value={deductions.seimeiNenkin}
          onChange={v => set('seimeiNenkin', v)}
        />
        <NumInput
          label="地震保険料控除"
          value={deductions.kasai}
          onChange={v => set('kasai', v)}
        />
        <div className="space-y-2">
          <Checkbox
            label="ふるさと納税"
            checked={furusatoOpen}
            onChange={v => {
              setFurusatoOpen(v)
              if (!v) set('furusato', 0)
            }}
          />
          {furusatoOpen && (
            <div className="ml-6 space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">[ ふるさと納税上限額シミュレーション ]</p>
                <p className="text-xs text-gray-600 mb-2">現在の入力値から計算した目安の上限額:</p>
                <div className="border border-gray-300 rounded p-3 bg-gray-50 inline-block min-w-[220px]">
                  <p className="text-xs font-semibold text-gray-700">ふるさと納税 上限目安額</p>
                  <p className="text-lg font-bold text-blue-700 mt-1">¥ {furusatoLimit.toLocaleString('ja-JP')} 円</p>
                  <p className="text-xs text-gray-500">（うち自己負担: 2,000円）</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">※ 他の控除の入力状況によって変動します</p>
                <p className="text-xs text-gray-500">※ 詳細は各ふるさと納税サイトのシミュレーターでご確認ください</p>
              </div>
              <NumInput
                label="寄附金額（自己負担2千円超分）"
                value={deductions.furusato}
                onChange={v => set('furusato', v)}
              />
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">税額控除</h3>

        <Checkbox
          label="住宅ローン控除"
          checked={deductions.jutaku}
          onChange={v => set('jutaku', v)}
        />
        {deductions.jutaku && (
          <div className="space-y-2">
            <NumInput
              label="年末ローン残高"
              value={deductions.loanBalance}
              onChange={v => set('loanBalance', v)}
            />
            <div className="flex flex-wrap items-center gap-2 ml-6">
              <label className="text-sm text-gray-700 w-52">控除率</label>
              <input
                type="number"
                value={Math.round(deductions.loanRate * 1000) / 10}
                onChange={e => set('loanRate', (parseFloat(e.target.value) || 0) / 100)}
                min={0}
                max={1}
                step="0.1"
                placeholder="0.7"
                className="rounded border border-gray-300 px-2 py-1 text-sm text-right text-gray-900 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700">%（通常0.7%）</span>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-700 ml-1">
          配当控除・外国税額控除は現在計算対象外です
        </p>
      </section>
    </div>
  )
}
