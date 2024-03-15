import type { ReportListParams } from '@/api/reportManagement/types'

export type HeaderquartersTitleItem = { title: string; onClick?(): void }

export type ReportTableParams = Omit<ReportListParams, 'account'> & {
  isTertiary?: boolean // 是否是三级代理
}
