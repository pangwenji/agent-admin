import { APIListParams } from '../common/types'

/* eslint-disable no-magic-numbers */

export type DrawingInfoParams = APIListParams & {
  lotteryCode: string
  status?: number
  periodsNumber?: number
  agentIds?: number[]
}

// 运动类型(1,足球)(3,篮球)
export const enum SportsDrawingType {
  Soccer = 1,
  Basketball = 3
}

export type SportsDrawingInfoParams = APIListParams & {
  startTime?: string
  endTime?: string
  sportsId: SportsDrawingType
  matchName: string
}

export enum LotteryDrawStatus {
  Open = 0,
  Drawing,
  Maintaining = 9
}

export interface LotteryDrawItem {
  id: number
  lotteryCode: string
  lotteryName: string
  periodsNumber: number
  autoDrawingDate: null | string // 开盘时间
  autoCloseDate: null | string // 封盘时间
  drawingDate: null | string // 自动开奖时间
  drawingResult: null | string
  startBillTime: null | string // 系统的真实开奖时间
  endBillTime: null | string
  status: LotteryDrawStatus
  manualResult: null | string
  rewardAmount: number
  totalAmount: number
  betNum: number
  betPeople: number
  winLoseAmount: number
}

export interface SportsDrawItem {
  matchId: string
  orderNo: string
  sportsType: string
  matchName: string
  matchTime: string
  matchTeam: string
  firstHalf: string
  secondHalf: string
  fullCourt: string
  cornerKick: string
  penaltyCard: string
  sectionOne: string
  sectionTwo: string
  sectionThree: string
  sectionFour: string
  sectionFull: string
  betNumber: number
  bettorsNumber: number
  totalAmount: number
  rewardAmount: number
  systemProfitLoss: number
}

import { AgentLevel, AgentType } from '@/enum'

export type GameOrderListParams = {
  current: number
  size: number
  lotteryCode: string
  queryCode?: number
  userId?: Array<any>
  periodsNumber?: number | null | string
  startTime?: string
  endTime?: string
  userName?: string
  orderStatus: number[]
}

export type GameOrderItem = {
  id: number
  lotteryName: string
  orderNo: string
  orderDetailNo: string
  userName: string
  playTypeName: string
  periodsNumber: number
  betContent: string
  odds: number
  betAmount: number
  totalAmount: number
  validAmount: number
  runningAmount: number
  returnAmount: number
  rewardAmount: number
  winLoseAmount: number
  orderStatus: GameOrderStatus
  orderDate: string
  billTime: string
  playName: string
  agentPercentage: string
  agentResult: string
  winAndLose: WinAndLoseStatus
  proxyId: number
  awardsCode: string
  batch: number
  isFlyOpen: number
  isManualFlyOpen: number
  handicapCode: string
}

export type SportsOrderListParams = APIListParams & {
  startTime?: string
  endTime?: string
  sportsType: SportsDrawingType
  matchId: string
  account?: string
}
export type SportsOrderItem = {
  orderDetailNo: string
  betDate: string
  account: string
  gameType: string
  gameTypeDetail: string
  betAmount: number
  validAmount: number
  playType: string
  odd: number
  betContent: string
  runningAmount: number
  returnRatio: number
  playerWinLoseAmount: number
  orderStatus: string
  currentPercentage: number
  currentResult: number
}

export const enum WinAndLoseStatus {
  Lose = 1,
  Tie,
  Win,
  NotCal
}

export const WinAndLoseStatusEnums = {
  [WinAndLoseStatus.Lose]: '输',
  [WinAndLoseStatus.Tie]: '和',
  [WinAndLoseStatus.Win]: '赢',
  [WinAndLoseStatus.NotCal]: '不计算'
}

export enum GameOrderStatus {
  Unsettled = 0,
  NotWon,
  Won,
  Cancelled,
  SystemCancelled,
  Deduct,
  ReturnCapital
}
export const GameOrderStatusEnums = {
  [GameOrderStatus.Unsettled]: '待开奖',
  [GameOrderStatus.NotWon]: '未中奖',
  [GameOrderStatus.Won]: '已派奖',
  [GameOrderStatus.Cancelled]: '玩家撤单',
  [GameOrderStatus.SystemCancelled]: '系统撤单',
  [GameOrderStatus.Deduct]: '限红扣除',
  [GameOrderStatus.ReturnCapital]: '退还本金'
}

const AllOrderStatus = [
  GameOrderStatus.Unsettled,
  GameOrderStatus.NotWon,
  GameOrderStatus.Won,
  GameOrderStatus.Cancelled,
  GameOrderStatus.SystemCancelled,
  GameOrderStatus.Deduct,
  GameOrderStatus.ReturnCapital
]
export const OrderStatusMap = {
  All: AllOrderStatus,
  Unsettled: [GameOrderStatus.Unsettled],
  Settled: AllOrderStatus.slice(1)
}

type PercentDetailItem = {
  percentage: number
  agentAccount: string
  agentType: AgentType
  agentLevel: null | AgentLevel
}

export type PercentDetailData = {
  totalOrderPercentageVO: null | PercentDetailItem
  branchOrderPercentageVO: null | PercentDetailItem
  oneOrderPercentageVO: null | PercentDetailItem
  twoOrderPercentageVO: null | PercentDetailItem
  threeOrderPercentageVO: null | PercentDetailItem
}
