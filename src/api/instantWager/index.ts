import request from '@/config/axios'
import type { LotteryOddsItem, LotteryOddsParams, OddsListVOListItem } from './types'
import { APICommonTableData } from '../common/types'

// 查询彩票赔率
export const queryLotteryOddsApi = (data: LotteryOddsParams) =>
  request.get<APICommonTableData<LotteryOddsItem>>({
    url: '/agent/lottery/findOddsPage',
    params: data
  })

// 批量修改赔率
export const updateLotteryOdds = (data: OddsListVOListItem[]) =>
  request.post({ url: '/agent/lottery/updateOddsBatch', data })
