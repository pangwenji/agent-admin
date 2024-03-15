import request from '@/config/axios'
import {
  ReportDetailItem,
  ReportDetailParams,
  ReportDetailSummaryItem,
  ReportListParams,
  ReportRecordItem,
  SettlementDetail
} from './types'
import type { APICommonTableData, APIListParams } from '../common/types'

export const getReportPage = (data: APIListParams & ReportListParams) =>
  request.post<APICommonTableData<ReportRecordItem>>({ url: '/agent/report/page', data })

export const getLotteryDetailReport = (data: APIListParams & ReportDetailParams) =>
  request.post<
    APICommonTableData<
      ReportDetailItem,
      {
        pageSum: ReportDetailSummaryItem
        allSum: ReportDetailSummaryItem
      }
    >
  >({ url: '/agent/report/lottery/detail', data })

export const getSportsDetailReport = (data: APIListParams & ReportDetailParams) =>
  request.post<
    APICommonTableData<
      ReportDetailItem,
      {
        pageSum: ReportDetailSummaryItem
        allSum: ReportDetailSummaryItem
      }
    >
  >({ url: '/agent/report/sports/detail', data })

export const getVideoDetailReport = (data: APIListParams & ReportDetailParams) =>
  request.post<
    APICommonTableData<
      ReportDetailItem,
      {
        pageSum: ReportDetailSummaryItem
        allSum: ReportDetailSummaryItem
      }
    >
  >({ url: '/agent/report/video/detail', data })

// 结算明细
export const getSettlementDetail = (params: { orderNo: string }) =>
  request.get<SettlementDetail>({ url: '/agent/report/settlement/detail', params })
