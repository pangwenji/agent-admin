/* eslint-disable no-magic-numbers */
import { Ref } from 'vue'

export type LotteryOddsParams = {
  current: number
  lotteryCode: string
  size?: number
  handicapCode?: string
  merchantId?: number
  periodsNumber?: number
}

export type LotteryOddsItem = {
  playTypeName: string
  playTypeCode: string
  lotteryCode: string
  orderNum: number
  oddsListVOList: OddsListVOListItem[]
  totalAmount: number //  虚注
  actualAmount: number // 实注
  profitAndLossAmount: number
}

export type OddsListVOListItem = {
  id: number
  playName: string | number
  playCode: string
  lotteryName: string
  odds: number
  maxOdds: number
  singleMaxLimit: number
  singleMinLimit: number
  orderNum: number
  isAwards: number
  handicapCode: string
  spanConfig?: {
    rowspan: number
    colspan: number
  }
} & Omit<LotteryOddsItem, 'oddsListVOList'>

export type LotteryTrickItem = Pick<
  LotteryOddsItem,
  | 'playTypeName'
  | 'profitAndLossAmount'
  | 'playTypeCode'
  | 'totalAmount'
  | 'actualAmount'
  | 'lotteryCode'
> & {
  options?: LotteryTrickItem[]
}

export interface WagerOddsChangeItem {
  playTypeCode: string
  playTypeName: string
  playName: string
  playCode: string
  lotteryName: string
  lotteryCode: string
  odds: number
  maxOdds: number
  isAwards: number
  handicapCode: string
}
export interface WagerOddsChangeData {
  messageType: number
  message: WagerOddsChangeItem[]
}

export interface InstantWagerInjectData {
  handleCalInTable(row: OddsListVOListItem, odds: number): Promise<void>
  gotoDetailOrder(): void
  showTotalAmount: Ref<boolean>
  isOddsOpen: Ref<boolean>
  selectedRowList: OddsListVOListItem[]
  selectRow(row: OddsListVOListItem): void
}
