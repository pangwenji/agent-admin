import { SwitchStatus } from '@/enum'

export type SystemConfigData = {
  id: string | number
  quota: number
  percentage: number
  isOddOpen: SwitchStatus
  isRebateOpen: SwitchStatus
  isFlyOpen: SwitchStatus
}

export type SystemConfigEditParams = Omit<SystemConfigData, 'quota' | 'percentage'> & {
  quota?: number
  percentage?: number
}

export const QuotaOperataOptions = [
  { value: SwitchStatus.Close, label: '存入' },
  { value: SwitchStatus.Open, label: '取出' }
]

export type SystemConfigQuotaEditParams = Pick<SystemConfigData, 'id' | 'quota'> & {
  operate: SwitchStatus // 存取 0:存 1:取,可用值:0,1
}
