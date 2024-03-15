const hasLoginUrl = '/agent/'
export enum BackApi {
  VerificationCode = `/scy/verificationCode`,
  Login = `/scy/agent_login`,
  CheckGoogleCode = `/scy/checkGoogleCode`,
  UpdateOperatePwd = `${hasLoginUrl}account/agent/updateOperatePwd`,
  loginOut = `/scy/logout`,
  lotteryHistory = `${hasLoginUrl}lottery/findDrawPage`,
  queryLotteryOdds = `${hasLoginUrl}lottery/findOddsPage`,
  updateOddsBatch = `${hasLoginUrl}lottery/updateOddsBatch`,
  queryNoteDetail = `${hasLoginUrl}report/lottery/detail`,
  percentageDetail = `${hasLoginUrl}lottery/percentage/detail`,
  walkAndFlys = `${hasLoginUrl}lottery/flyOpen`,
  cancelNote = `${hasLoginUrl}lottery/order/cancel`,
  updatePassword = `${hasLoginUrl}person/updatePwd`,
  flyOpen = `${hasLoginUrl}lottery/flyOpen`
}

export const enum SwitchStatus {
  Close = 0,
  Open = 1
}

//0总公司 1分公司 2代理
export const enum AgentType {
  Headquarters = 0,
  Branch,
  Agent
}

export const AgentTypeEnums = {
  [AgentType.Headquarters]: '总公司',
  [AgentType.Branch]: '分公司',
  [AgentType.Agent]: '代理'
}

//1一级代理 2二级代理 3三级代理
export const enum AgentLevel {
  Primary = 1,
  Secondary,
  Tertiary
}
