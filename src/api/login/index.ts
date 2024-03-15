import request from '@/config/axios'
import type { UserType } from './types'
import { BackApi } from '@/enum'

interface RoleParams {
  roleName: string
}

export const loginApi = (data: string): Promise<IResponse<UserType>> => {
  return request.post({ url: '/user/login', data })
}
export const getCaptcha = async (data: { browserFingerprint: string }) => {
  const res = await request.post({ url: BackApi.VerificationCode, data, responseType: 'blob' })
  return (res.data && window.URL.createObjectURL(res.data)) as string | undefined
}

export const login = (data): Promise<IResponse<any>> => request.post({ url: BackApi.Login, data })

export const setGoogleCode = (data): Promise<IResponse<any>> =>
  request.post({ url: BackApi.CheckGoogleCode, data })

export const setPassword = (data): Promise<IResponse<any>> =>
  request.get({ url: `${BackApi.UpdateOperatePwd}`, params: data })

export const loginOutApi = (): Promise<IResponse> => {
  return request.get({ url: '/user/loginOut' })
}
export const loginOut = (): Promise<IResponse> => {
  return request.post({ url: BackApi.loginOut })
}

export const getUserListApi = ({ params }: AxiosConfig) => {
  return request.get<{
    code: string
    data: {
      list: UserType[]
      total: number
    }
  }>({ url: '/user/list', params })
}

export const getAdminRoleApi = (
  params: RoleParams
): Promise<IResponse<AppCustomRouteRecordRaw[]>> => {
  return request.get({ url: '/role/list', params })
}

export const getTestRoleApi = (params: RoleParams): Promise<IResponse<string[]>> => {
  return request.get({ url: '/role/list2', params })
}
