import request from '@/config/axios'
import { APIListParams, APICommonTableData } from '@/api/common/types'
import {
  SmartLongItem,
  SmartLongEditItem,
  SmartReduceGame,
  SmartReduceUserType,
  SmartReduceUser,
  AddSmartReduceUserParams,
  SmartReduceConfigType,
  SmartAmountItem,
  PlayTypeMenuItem,
  SubPlayTypeMenuItem,
  SmartAmountEditItem,
  SmartAmountConfigItem,
  SmartAmountConfigAddItem,
  SmartAmountConfigEditItem
} from './types'
import { SwitchStatus } from '@/enum'

// 智能降赔 - 通用
export const getAllSmartConfigStatus = (data: {
  gameCode: string
  smartType: SmartReduceConfigType
}) => {
  return request.get<boolean>({ url: '/agent/smart/findSwitch', params: data })
}

export const updateAllSmartConfigStatus = (data: {
  gameCode: string
  isValidity: SwitchStatus
  smartType: SmartReduceConfigType
}) => {
  return request.post({ url: '/agent/smart/updateSwitch', data })
}

// 智能降赔-长龙配置
export const getSmartReduceGameList = () => {
  return request.get<SmartReduceGame[]>({ url: '/agent/smart/findGameList' })
}

export const getSmartLongList = (data: APIListParams & { gameCode: string }) => {
  return request.post<APICommonTableData<SmartLongItem>>({ url: '/agent/smart/findPage', data })
}

export const saveSmartLong = (data: SmartLongEditItem) => {
  return request.post({ url: '/agent/smart/save', data })
}

export const deleteSmartLong = (data: { id: number; lotteryCode: string }) => {
  return request.get({ url: '/agent/smart/deleteSmart', params: data })
}

export const updateSmartLongStatus = (data: {
  id: number
  lotteryCode: string
  isValidity: SwitchStatus
}) => {
  return request.post({ url: '/agent/smart/updateSmart', data })
}

// 智能降赔-虚注金额
export const getSmartAmountList = (data: APIListParams & { gameCode: string }) => {
  return request.post<APICommonTableData<SmartAmountItem>>({
    url: '/agent/smart/findPlayPage',
    data
  })
}
export const updateSmartAmountStatus = (data: {
  id: number
  lotteryCode: string
  isValidity: SwitchStatus
}) => {
  return request.post({ url: '/agent/smart/updatePlay', data })
}

export const saveSmartAmount = (data: SmartAmountEditItem) => {
  return request.post({ url: '/agent/smart/savePlay', data })
}
export const deleteSmartAmount = (data: { id: number; lotteryCode: string }) => {
  return request.get({ url: '/agent/smart/deletePlay', params: data })
}

export const getSmartAmountConfigList = (data: APIListParams & { id: number }) => {
  return request.post<APICommonTableData<SmartAmountConfigItem>>({
    url: '/agent/smart/findPlayConfigPage',
    data
  })
}
export const addSmartAmountConfig = (data: SmartAmountConfigAddItem) => {
  return request.post({ url: '/agent/smart/savePlayConfig', data })
}
export const updateSmartAmountConfig = (data: SmartAmountConfigEditItem) => {
  return request.post({ url: '/agent/smart/updatePlayConfig', data })
}
export const deleteSmartAmountConfig = (data: { id: number; lotteryCode: string }) => {
  return request.post({ url: '/agent/smart/deletePlayConfigPage', params: data })
}

// 虚注金额降配-查询一级玩法菜单
export const getPlayTypeMenu = (data: { lotteryCode: string }) => {
  return request.get<PlayTypeMenuItem[]>({ url: '/agent/smart/findPlayMenu', params: data })
}
// 虚注金额降配-查询一级玩法菜单
export const getSubPlayTypeMenu = (data: { lotteryCode: string; playTypeCode: string }) => {
  return request.get<SubPlayTypeMenuItem[]>({ url: '/agent/smart/findSubPlayMenu', params: data })
}

// 智能降赔-点控代理/会员
const getSmartReduceUserList = (
  data: APIListParams & { id: number; type: SmartReduceUserType; smartType: SmartReduceConfigType }
) => {
  return request.post<APICommonTableData<SmartReduceUser>>({
    url: '/agent/smart/findListPage',
    data
  })
}

export const getSmartReduceAgentList = (
  data: APIListParams & { id: number; smartType: SmartReduceConfigType }
) => {
  return getSmartReduceUserList({
    ...data,
    type: SmartReduceUserType.Agent
  })
}

export const getSmartReduceMemberList = (
  data: APIListParams & { id: number; smartType: SmartReduceConfigType }
) => {
  return getSmartReduceUserList({
    ...data,
    type: SmartReduceUserType.Member
  })
}

const addSmartReduceUser = (data: AddSmartReduceUserParams) => {
  return request.post({ url: '/agent/smart/addRelevance', data })
}

export const addSmartReduceAgent = (data: Omit<AddSmartReduceUserParams, 'type'>) => {
  return addSmartReduceUser({
    ...data,
    type: SmartReduceUserType.Agent
  })
}

export const addSmartReduceMember = (data: Omit<AddSmartReduceUserParams, 'type'>) => {
  return addSmartReduceUser({
    ...data,
    type: SmartReduceUserType.Member
  })
}

export const deleteSmartReduceUser = (data: Omit<AddSmartReduceUserParams, 'type' | 'account'>) => {
  return request.get({ url: '/agent/smart/deleteRelevance', params: data })
}
