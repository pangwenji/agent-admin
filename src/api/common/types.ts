/* eslint-disable no-magic-numbers */
export type APIListParams = {
  current: number
  size: number
  orders?: Array<{ column: string; asc: boolean }>
}

export type APICommonTableData<
  TableData extends Record<string, any>,
  U extends Record<string, any> = {}
> = {
  records: TableData[]
  total: number
  size: number
  current: number
  orders: []
  optimizeCountSql: boolean
  searchCount: boolean
  maxLimit: null
  countId: null
  pages: number
} & U

export type APISimpleTableData<
  TableData extends Record<string, any>,
  U extends Record<string, any> = {}
> = {
  data: TableData[]
  total: number
  size: number
  current: number
  pages: number
} & U

export const enum APIResponseCodes {
  OtherLogin = 10017,
  LoginTimeout = 10022,
  Need2ReLogin = 10023,
  NotLogin = 10001,
  GoogleTry3Relogin = 30008,
  IPForbidden = 10016
}
