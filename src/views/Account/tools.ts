import { ElMessage } from 'element-plus'
import clipboard3 from 'vue-clipboard3'
import { useAgentInfoStore } from '@/store/modules/agentInfo'
import { getRegisterLink } from '@/api/account'

export const useCopyRegisterLink = () => {
  // 复制注册链接
  const { toClipboard } = clipboard3()
  const agentInfoStore = useAgentInfoStore()
  const onMemberCopyLink = async () => {
    try {
      let agentInfo = agentInfoStore.info
      if (!agentInfo) {
        agentInfo = await agentInfoStore.getAgentInfo()
      }
      const result = await getRegisterLink({ agentId: agentInfo!.id })
      await toClipboard(result.message!)
      ElMessage.success('复制成功')
    } catch (error) {
      ElMessage.error('复制失败')
    }
  }

  // 复制注册链接
  const onAgentCopyLink = async () => {
    try {
      let agentInfo = agentInfoStore.info
      if (!agentInfo) {
        agentInfo = await agentInfoStore.getAgentInfo()
      }
      const inviteLink =
        location.origin + '/#/register?invited=' + agentInfo?.recommendLink + '&type=agent'
      await toClipboard(inviteLink)
      ElMessage.success('复制成功')
    } catch (error) {
      ElMessage.error('复制失败')
    }
  }
  return {
    onMemberCopyLink,
    onAgentCopyLink
  }
}

export const MemberStatusOptions = [
  {
    value: 1,
    label: '启用'
  },
  {
    value: 2,
    label: '停用'
  },
  {
    value: 3,
    label: '锁定',
    disabled: true
  }
]

export const AgentStatusOptions = [
  {
    value: 0,
    label: '启用'
  },
  {
    value: 1,
    label: '停用'
  },
  {
    value: 2,
    label: '锁定'
  }
]
