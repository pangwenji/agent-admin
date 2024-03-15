import { AgentLevel, AgentType, SwitchStatus } from '@/enum'

export interface enableParams {
  open: number
}

export interface HierarchyInfo {
  hierarchy: string
  account: string
  divinationConfig: string
  divinationActual: string
  agentId: number
  agentType: AgentType
  agentLevel: null | AgentLevel
}
export interface PersonalInfo {
  personQuota: number
  hierarchyInfos: HierarchyInfo[]
  isOddOpen: SwitchStatus
  isRebateOpen: SwitchStatus
  isFlyOpen: SwitchStatus
}
