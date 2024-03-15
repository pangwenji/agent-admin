import { SwitchStatus } from '@/enum'

export type LoginLogData = {
  id: string
  userId: number
  account: string
  domainName: string
  ipAddr: string
  ipType: string
  locationCity: string
  clientType: string
  isSuccess: SwitchStatus
  remark: string
  createTime: string
}

// 0.操作账变,1.投注账变
export const enum TradeChangeType {
  All = -1,
  Operate,
  Bet
}
export type TradeLogData = {
  remark: null
  createTime: string
  updateTime: string
  updaterUser: null
  id: number
  agentId: number
  agentAccount: string
  agentLevel: number
  tradeType: number
  tradeAmount: number
  beforeBalance: number
  afterBalance: number
  tradeChangeType: TradeChangeType
}

export type OperateLogData = {
  remark: null
  createTime: string
  updateTime: string
  updaterUser: null
  id: number
  module: string
  operate: string
  optUserId: number
  userName: string
  domainName: null
  ipAddress: string
  location: string
  params: null
  response: null
}
