import request from '@/config/axios'
import { SystemConfigData, SystemConfigEditParams, SystemConfigQuotaEditParams } from './types'

export const getSystemConfig = (data: { id: number }) => {
  return request.post<SystemConfigData>({ url: '/agent/sys/confog/get', data })
}

export const getBeijingTime = () => {
  return request.get<SystemConfigData>({ url: '/agent/sys/confog/time' })
}

export const editSystemOtherConfig = (data: SystemConfigEditParams) => {
  return request.post<SystemConfigData>({ url: '/agent/sys/confog/other', data })
}

export const editSystemQuota = (data: SystemConfigQuotaEditParams) => {
  return request.post<SystemConfigData>({ url: '/agent/sys/confog/quota/update', data })
}
