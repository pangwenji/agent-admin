import request from '@/config/axios'
import { PersonalInfo, enableParams } from './types'

// 个人资料
export const personInfoApi = () => {
  return request.get<PersonalInfo>({ url: '/agent/person/info' })
}

// google验证码信息
export const googleInfoApi = () => {
  return request.get({ url: '/agent/person/googleInfo' })
}

// google开关
export const googleEnableApi = (params: enableParams) => {
  return request.get({ url: '/agent/person/googleEnable', params })
}
