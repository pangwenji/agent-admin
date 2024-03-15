export type ReportListParams = {
  account?: string

  endTime?: string

  startTime?: string
  // 1.全部汇总数据，2.代理汇总数据 3.会员汇总数据，4.代理列表数据，5.会员列表数据
  // 不传查1，传1查23，传2查4，传3查5,传4查2
  recordType?: ReportRecordType
  // 不传则查询当前登录人，传则查询指定下级
  agentId?: number
  gameType?: ReportGameType | null
}

export type ReportSearchParams = {
  account?: string
  timeRange?: Date[]
}

export const enum ReportRecordType {
  All = 1,
  AgentAll,
  MemberAll,
  AgentList,
  MemberList
}

// 报表游戏类型:(1, 彩票)(2, 体育)(3,捕鱼)(4,棋牌)(5, 视讯)
export const enum ReportGameType {
  Lottery = 1,
  Sports,
  Fishing,
  Card,
  Video
}

export type ReportRecordItem = {
  account: null | string
  agentId: null | number
  agentL1Result: null | number
  agentL2Result: null | number
  agentL3Result: null | number
  betAmount: null | number
  betCount: null | number
  getOdd: null | number
  getRebate: null | number
  handOverAmount: null | number
  handOverResult: null | number
  playerId: null | string
  playerResult: null | number
  rebate: null | number
  recordType: ReportRecordType
  gameType: ReportGameType | null // null 合计
  subCompanyResult: null | number
  type: null | string
  validAmount: null | number
  hasDownLine: boolean
}

export type ReportDetailParams = {
  startTime?: string
  endTime?: string
  playerId: string
  orderStatus?: string
}

export type ReportDetailSearchParams = {
  orderStatus?: string
  timeRange?: Date[]
}

export type ReportDetailSummaryItem = {
  type?: string
  orderCount: number
  betAmount: number
  effectiveBet: number
  rewardAmount: number
}

export type ReportDetailItem = {
  orderDetailNo: string
  betDate: string
  gameName: string
  gamePeriod: string
  betAmount: number
  effectiveBet: number
  playType: string
  odd: number
  betContent: string
  winOrLoss: string
  rebateAmount: number
  rewardAmount: number
  winOrLossAmount: number
  playerResult: string
  agentL3Percentage: null
  agentL2Percentage: null
  agentL1Percentage: null
  subCompanyPercentage: null
  parentCompanyPercentage: number
  handicapCode: string
  lotteryCode: string
}

export type SettlementDetailOrderInfo = {
  userAccount: string
  lotteryName: string
  periodsNumber: number
  orderDate: string
  totalAmount: number
  validAmount: number
  playTypeName: string
  playName: string
  odds: number
  returnPointRatio: string
  settlementDate: string
  winOrLoss: string
  rewardAmount: number
  returnAmount: number
}

export type SettlementDetailConfigItem = {
  agentType: string
  rebateAndGetRebate: string
  oddAndGetOdd: string
  percentageAndResult: string
}

export type SettlementDetailTransactionRecord = {
  agentType: string
  beforeTransfer: number
  transactionAmount: string
  afterTransfer: number
}
export type SettlementDetail = {
  orderNo: string
  winOrLoss: string
  allExpense: number
  orderInfo: SettlementDetailOrderInfo
  settlementConfigs: SettlementDetailConfigItem[]
  transactionRecords: SettlementDetailTransactionRecord[]
}
