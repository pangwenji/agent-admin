import request from '@/config/axios'
import {
  AccountParams,
  EditDirectParams,
  EnableParams,
  IdParams,
  QuotaUpdate,
  RegisterAgentParams,
  CommonEnableParams,
  RebateLimitCode,
  UpdateLimitParams,
  DayLogParams,
  LotteryItem,
  RebateLimitData,
  AccountAgentInfo,
  DirectAgentItem,
  AllAgentItem
} from './types'
import { APICommonTableData } from '../common/types'

// const prefixServer = '/agent/'

// 直属代理列表
export const directAgentPageApi = (params: AccountParams) => {
  return request.post<APICommonTableData<DirectAgentItem>>({
    url: '/agent/account/agent/direct/page',
    data: params
  })
}

// 全部代理列表
export const directAgentAllPageApi = (params: AccountParams) => {
  return request.post<APICommonTableData<AllAgentItem>>({
    url: '/agent/account/agent/all/page',
    data: params
  })
}

// 新增代理
export const createAgentApi = (params: EditDirectParams) => {
  return request.post({ url: '/agent/account/agent/create', data: params })
}

// 编辑代理
export const editAgentApi = (params: EditDirectParams) => {
  return request.post({ url: '/agent/account/agent/update', data: params })
}

// 代理--停用/启用/锁定
export const agentEnableApi = (params: EnableParams) => {
  return request.post({ url: '/agent/account/agent/enable', data: params })
}

// 解锁代理
export const unlockAgentApi = (params: IdParams) => {
  return request.get({ url: '/agent/account/agent/unlock', params })
}

// 代理通用（赔率、返水、走飞）启用-停用
export const commonEnableApi = (params: CommonEnableParams) => {
  return request.post({ url: '/agent/account/agent/commonEnable', data: params })
}

// 直属会员列表
export const directPlayerPageApi = (params: AccountParams) => {
  return request.post({ url: '/agent/account/player/direct/page', data: params })
}

// 全部会员列表
export const directPlayerAllPageApi = (params: AccountParams) => {
  return request.post({ url: '/agent/account/player/all/page', data: params })
}

// 新增会员
export const createPlayerApi = (params: EditDirectParams) => {
  return request.post({ url: '/agent/account/player/create', data: params })
}

// 编辑会员
export const editPlayerApi = (params: EditDirectParams) => {
  return request.post({ url: '/agent/account/player/update', data: params })
}

// 会员--停用/启用/锁定
export const playerEnableApi = (params: EnableParams) => {
  return request.post({ url: '/agent/account/player/enable', data: params })
}

// 修改代理/会员额度存取
export const quotaUpdateExt = (params: QuotaUpdate) => {
  return request.post({ url: '/agent/account/common/quotaUpdateExt', data: params })
}

// 代理注册
export const registerAgentApi = (params: RegisterAgentParams) => {
  return request.post({ url: '/agent/register', data: params })
}

// 会员注册
export const registerPlayerApi = (params: RegisterAgentParams) => {
  return request.post({ url: '/agent/playerRegister', data: params })
}

// 获取当前登录代理的信息
export const agentInfoApi = () => {
  return request.get<AccountAgentInfo>({ url: '/agent/account/agent/info' })
}

// 返水限额
export const rebateLimitApi = (params: RebateLimitCode) => {
  return request.get<RebateLimitData>({ url: '/agent/person/rebateLimit', params })
}

// 返水限额编辑
export const updateLimitApi = (params: UpdateLimitParams) => {
  return request.post({ url: '/agent/person/rebateLimit/update', data: params })
}

// 游戏列表
export const getLotteryListApi = () => {
  return request.get<LotteryItem[]>({ url: '/agent/lottery/list' })
}

// 在线人数统计
export const getOnlineApi = () => {
  return request.get({ url: '/agent/person/onlineNum' })
}

// 查询下级代理列表
export const queryAllSubAgentsApi = (params) => {
  return request.post({ url: '/agent/account/agent/queryAllSubAgents', data: params })
}

// 获取总公司配置信息接口
export const headOfficeInfoApi = () => {
  return request.get({ url: '/agent/sys/confog/headOffice/get' })
}

// 登录日志分页查询
export const logLoginApi = (params: DayLogParams) => {
  return request.post({ url: '/agent/log/login/page', data: params })
}

// 操作日志分页查询
export const logOperateApi = (params: DayLogParams) => {
  return request.post({ url: '/agent/log/operate/page', data: params })
}

// 账变日志分页查询
export const logTradeApi = (params: DayLogParams) => {
  return request.post({ url: '/agent/log/trade/page', data: params })
}

// 代理邀请会员注册链接拼接
export const getRegisterLink = (params: { agentId: number }) => {
  return request.get({ url: '/agent/account/agent/agentInvitePlayer', params })
}

// 重置操作密码
export const resetOperatePwd = (params: { id: number | string }) => {
  return request.get({ url: '/agent/account/agent/resetOptPwd', params })
}

// 验证操作密码
export const checkOperatePwd = (data: { operatePwd: string }) => {
  return request.post({ url: '/agent/account/agent/checkOptPwd', data })
}
