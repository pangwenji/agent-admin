import request from '@/config/axios'
import type {
  LotteryDrawItem,
  DrawingInfoParams,
  SportsDrawingInfoParams,
  SportsDrawItem,
  SportsOrderListParams,
  SportsOrderItem
} from './types'
import { APICommonTableData, APISimpleTableData } from '../common/types'
import {
  PercentDetailData,
  type GameOrderItem,
  type GameOrderListParams,
  OrderStatusMap
} from './types'
import { BackApi } from '@/enum'
import { DrawingOrderType } from '@/views/DrawingResult/tools'

// 彩票开奖信息
export const queryLotteryDrawingInfo = (data: DrawingInfoParams) =>
  request.post<APISimpleTableData<LotteryDrawItem>>({
    url: '/agent/lottery/findDrawPage',
    data
  })

// 体育开奖信息
export const querySportsDrawingInfo = (data: SportsDrawingInfoParams) =>
  request.post<APICommonTableData<SportsDrawItem>>({
    url: '/agent/draw/sports/drawResult',
    data
  })

// 彩票详细注单
export const queryGameOrderList = (
  data: Omit<GameOrderListParams, 'orderStatus'>,
  settled?: boolean
) =>
  request.post<APISimpleTableData<GameOrderItem>>({
    url: '/agent/lottery/settlement/findLotteryOrderPage',
    data: {
      ...data,
      orderStatus:
        typeof settled === 'boolean'
          ? settled
            ? OrderStatusMap.Settled
            : OrderStatusMap.Unsettled
          : OrderStatusMap.All
    }
  })

export const getOrderPercentageDetail = (
  params: { orderDetailNo: string; agentId: number },
  type: DrawingOrderType
) =>
  request.get<PercentDetailData>({
    url:
      type === DrawingOrderType.Lottery
        ? '/agent/lottery/percentage/detail'
        : '/agent/draw/sports/percentage',
    params
  })

export const cancelOrder = (params: { id: number; lotteryCode: string; orderDetailNo?: string }) =>
  request.get({ url: '/agent/lottery/order/cancel', params })

export const flyOpenOrder = (data: { agentId: number; orderDetailNo: string; isFlyOpen: number }) =>
  request.post({ url: '/agent/lottery/flyOpen', data })

export const updatePasswords = (data: any): Promise<IResponse<any>> =>
  request.post({ url: BackApi.updatePassword, data })

// 体育详细注单
export const querySportsOrderList = (data: SportsOrderListParams) =>
  request.post<APICommonTableData<SportsOrderItem>>({
    url: '/agent/draw/sports/order',
    data
  })
