import { ref } from 'vue'
import { defineStore } from 'pinia'
import { agentInfoApi } from '@/api/account'
import { AccountAgentInfo } from '@/api/account/types'

export const useAgentInfoStore = defineStore(
  'agentInfo',
  () => {
    const info = ref<AccountAgentInfo>()
    const getAgentInfo = async (cb?: any) => {
      try {
        const res = await agentInfoApi()
        info.value = res.data
        if (cb) cb(res.data)
        return res.data
      } catch {}
    }
    return {
      info,
      getAgentInfo
    }
  },
  {
    persist: {
      enabled: true,
      strategies: [{ key: 'agent_info', storage: sessionStorage }]
    }
  }
)
