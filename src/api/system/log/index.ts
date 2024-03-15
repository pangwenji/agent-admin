import request from '@/config/axios'
import { APIListParams, APICommonTableData } from '@/api/common/types'
import { LoginLogData, TradeLogData, OperateLogData, TradeChangeType } from './types'

export const getLoginLogList = (data: APIListParams & { account?: string }) => {
  return request.post<APICommonTableData<LoginLogData>>({ url: '/agent/log/login/page', data })
}

export const getTradeLogList = (
  data: APIListParams & { account?: string; tradeChangeType?: TradeChangeType }
) => {
  return request.post<APICommonTableData<TradeLogData>>({ url: '/agent/log/trade/page', data })
}

export const getOperateLogList = (data: APIListParams & { account?: string }) => {
  return request.post<APICommonTableData<OperateLogData>>({ url: '/agent/log/operate/page', data })
}
