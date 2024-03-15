const formatMoneyReg = /(?<!\..*)\B(?=(\d{3})+(?!\d))/g
export const formatMoney = (money: number | string) => {
  return `${money}`.replace(formatMoneyReg, ',')
}

import { BigNumber } from 'bignumber.js'
const DefaultPrecision = 2
export const formatMoneyWithPrecision = (
  money: number | string,
  precision: number = DefaultPrecision
) => {
  return Number(money).toFixed(precision).replace(formatMoneyReg, ',')
}

const deformatMoneyReg = /\$\s?|(,*)/g
export const deformatMoney = (money: number | string) => {
  return `${money}`.replace(deformatMoneyReg, '')
}

export const numberMultiplied100 = (value: number | string, precision?: number) => {
  const scale = 100
  const BN = BigNumber.clone(Number.isInteger(precision) ? { DECIMAL_PLACES: precision } : {})
  return BN(Number(value)).multipliedBy(scale)
}

export const convert2Percent = (value: number | null | string, precision?: number) => {
  if (value === null) return value
  return numberMultiplied100(value, precision) + '%'
}
