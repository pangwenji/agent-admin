import { SwitchStatus } from '@/enum'

// 智能降配类型 1：长龙降配 2：虚注金额配置
export const enum SmartReduceConfigType {
  Long = 1,
  Amount
}

export type SmartReduceGame = {
  gameCode: string
  gameName: string
  orderNum: number
  isSmart: boolean // 是否存在长龙配置 true：是 false：否
}

export type SmartLongItem = {
  id: number
  gameName: string
  gameCode: string
  amountChange: number
  level: SmartReduceLevel
  isValidity: SwitchStatus
}

export const SwitchStatusEnums = {
  [SwitchStatus.Close]: '未启用',
  [SwitchStatus.Open]: '已启用'
}

/* eslint-disable no-magic-numbers */
// 级别 3：长龙3 ；4：长龙4
export const enum SmartReduceLevel {
  Third = 3,
  Forth = 4,
  Fifth,
  Sixth
}

export const SmartLongLevelEnums = {
  [SmartReduceLevel.Third]: '长龙3',
  [SmartReduceLevel.Forth]: '长龙4',
  [SmartReduceLevel.Fifth]: '长龙5',
  [SmartReduceLevel.Sixth]: '长龙6'
}

export const SmartLongLevelOptions = Object.entries(SmartLongLevelEnums).map(([value, label]) => {
  return {
    value,
    label
  }
})

export type SmartLongEditItem = {
  gameCode: string
  amountChange: string
  level: SmartReduceLevel
}

export type SmartAmountItem = {
  id: number
  gameCode: string
  gameName: string
  playTypeCode: string
  playTypeName: string
  playCode: string
  playName: string
  orderNum: number
  isValidity: SwitchStatus
}

export type SmartAmountEditItem = {
  gameCode: string
  playTypeCode: string
  playCode: string
}

export type SmartAmountConfigItem = {
  id: number
  smartOddsId: number
  amount: number
  amountChange: number
}

export type SmartAmountConfigAddItem = Omit<SmartAmountConfigItem, 'smartOddsId'>
export type SmartAmountConfigEditItem = Pick<SmartAmountConfigItem, 'id' | 'amountChange'> & {
  gameCode: string
}

export type PlayTypeMenuItem = {
  playTypeCode: string
  playTypeName: string
}
export type SubPlayTypeMenuItem = {
  playCode: string
  playName: string
}

// 1：查看点控代理；2：查看点控会员
export const enum SmartReduceUserType {
  Agent = 1,
  Member
}

export type SmartReduceUser = {
  id: number
  relevanceId: number
  account: string
  username: string
  parentId: number
  parentAccount: string
}

export type AddSmartReduceUserParams = {
  id: number
  account: string
  type: SmartReduceUserType
  lotteryCode: string
  smartType: SmartReduceConfigType
}
