import { getOnlineApi } from '@/api/account'
import { getBeijingTime } from '@/api/system/config'
import { useStorage } from '@/hooks/web/useStorage'
import { formatToDateTime } from '@/utils/dateUtil'
import { onMounted, onUnmounted, ref, nextTick } from 'vue'

export const useToolHeader = () => {
  // 在线人数统计
  const clearIntervals = ref()
  const { getStorage } = useStorage()
  const agentAmount = ref('')
  const playerAmount = ref('')
  const getOnlineNumber = async () => {
    if (!getStorage('token')) {
      return clearInterval(clearIntervals.value)
    }
    try {
      const res = await getOnlineApi()
      if (res.success) {
        const { agentNum, playerNum } = res.data
        agentAmount.value = agentNum
        playerAmount.value = playerNum
        await nextTick()
        checkScreenWidth()
      }
    } catch {}
  }
  getOnlineNumber()
  const onlineTimeout = 15000
  clearIntervals.value = setInterval(() => {
    if (window.navigator.onLine) getOnlineNumber()
  }, onlineTimeout)

  // 北京时间
  const beijingTime = ref('')
  let beijingTimeClear: NodeJS.Timeout
  const updateBeijingTime = () => {
    const updateTimeout = 1000
    beijingTimeClear = setInterval(() => {
      beijingTime.value = formatToDateTime(new Date(beijingTime.value).getTime() + updateTimeout)
    }, updateTimeout)
  }
  const initBeijingTime = async () => {
    clearBeijintTimer()
    try {
      const data = await getBeijingTime()
      beijingTime.value = data.message as string
      updateBeijingTime()
    } catch {}
  }
  const clearBeijintTimer = () => {
    beijingTimeClear && clearInterval(beijingTimeClear)
  }
  const visibilityHandler = () => {
    if (document.hidden) {
      clearBeijintTimer()
    } else {
      initBeijingTime()
    }
  }
  onMounted(() => {
    initBeijingTime()
    // 防止页面不可见时，浏览器性能优化减少定时器更新频率导致的时间误差
    document.addEventListener('visibilitychange', visibilityHandler)
  })
  onUnmounted(() => {
    clearBeijintTimer()
    document.removeEventListener('visibilitychange', visibilityHandler)
  })

  // 北京时间显示
  const showBeijing = ref(true)
  const checkOnlineWidth = () => {
    const limitOnlineW = 416.5
    const onlineW = document.querySelector('.custom-top-header .online')?.clientWidth || 0
    if (onlineW > limitOnlineW) {
      showBeijing.value = false
    } else {
      showBeijing.value = true
    }
  }
  const checkScreenWidth = () => {
    const screenW = window.document.documentElement.clientWidth
    const limitW = 1480
    if (screenW < limitW) {
      showBeijing.value = false
    } else {
      checkOnlineWidth()
    }
  }
  onMounted(() => {
    checkScreenWidth()
    window.addEventListener('resize', checkScreenWidth)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenWidth)
  })

  return {
    beijingTime,
    showBeijing,
    agentAmount,
    playerAmount
  }
}
