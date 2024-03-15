import { AgentLevel, AgentType, SwitchStatus } from '@/enum'

export interface AccountParams {
  current: number
  size: number
  accountOrUsername?: string
  status?: string | number
  agentId?: string
}

export type DirectAgentItem = {
  id: string
  isOnline: SwitchStatus
  agentType: string
  agentLevel: AgentLevel
  account: string
  username: string
  quota: string
  parentAccount: string
  parentPercentage: string
  parentSportsPercentage: string
  parentVideoPercentage: string
  childAgentCount: string
  childPlayerCount: string
  percentage: string
  videoPercentage: string
  sportsPercentage: string
  status: number
  createTime: string
  isOddOpen: null | number
  isRebateOpen: null | number
  isFlyOpen: null | number
  ipWhite: string
}

export type AllAgentItem = DirectAgentItem

export interface EditDirectParams {
  id?: number | string
  account: number | string
  username: number | string
  password: number | string
  percentage?: number | string
  videoPercentage?: number | string
  sportsPercentage?: number | string
  parentAccount?: number | string
  accountStatus?: number | string
  parentAgentId?: string
  parentPercentage?: string
  isBelow?: boolean
  ipWhite?: string
}

export interface EnableParams {
  id: string
  accountStatus: string
}

export interface QuotaUpdate {
  id: string
  type: number
  quota: string
  operateType: number
}

export enum selectOptions {
  '启用' = 0,
  '停用' = 1,
  '锁定'
}

export interface QueryPage {
  current: number
  size: number
}

export interface IdParams {
  id: number
}

export interface RegisterAgentParams {
  account: string | number
  username: string | number
  password: string
  verificationCode: string
  browserFingerprint?: string
  recommendLink?: string
}

export interface CommonEnableParams {
  id: string
  switchEnum: number
  statusType: number
}

export interface RebateLimitCode {
  lotteryCode: string
  handicapCode: string
  agentId?: string
}

export interface UpdateLimitParams {
  agentId?: string // 当不传递 agentId 时，更改当前代理的直属会员的返水配置
  lotteryCode: string
  handicapCode?: string
  playCode: string
  selfRebate: number | string
  selfSingleMaxLimit: number | string
  selfSingleIssueLimit: number | string
}

export interface NavParams {
  name?: string
  component?: any
  path?: string
  key?: string
}

export interface Option {
  value: number | string
  label: string
}

export interface DayLogParams {
  current: number
  size: number
  agentId: string
  account?: string | number
}

export interface LotteryHandicapItem {
  handicapCode: string
  handicapName: string
  orderNum: number
}
export interface LotteryItem {
  lotteryCode: string
  lotteryName: string
  orderNum: number
  iconUrl: string
  moveIconUrl: string
  isValidity: SwitchStatus
  remark: string
  maxReward: number
  cancelOrder: boolean
  handicapSwitch: SwitchStatus
  handicapNum: number
  sysHandicapList: null | LotteryHandicapItem[]
}

export interface RebateLimitItem {
  playName: string
  playCode: string
  singleMinLimit: number
  selfRebate: string
  upRebate: string
  selfSingleMaxLimit: number
  upSingleMaxLimit: number
  selfSingleIssueLimit: number
  upSingleIssueLimit: number
}
export interface RebateLimitData {
  maxOdd: number
  drawWaterRatio: number
  list: RebateLimitItem[]
}

export interface AccountAgentInfo {
  id: number
  account: string
  username: string
  isGoogleOpen: SwitchStatus
  googleKey: string
  googleUrl: string
  status: number
  recommendLink: string
  agentType: AgentType
  agentLevel: null | AgentLevel
  parentId: null | number
  quota: SwitchStatus
  percentage: number
  sportsPercentage: number
  videoPercentage: number
  isOddOpen: SwitchStatus
  isRebateOpen: SwitchStatus
  isFlyOpen: SwitchStatus
}
