<script setup lang="ts">
import { defineEmits, computed, defineProps, ref, watch, onUnmounted, unref } from 'vue'
import { ElCountdown, ElButton, ElSelect, ElOption, ElCheckbox } from 'element-plus'
import { queryLotteryDrawingInfo } from '@/api/drawingResult'
import { formatNumPadding, refreshOptions } from '@/hooks/web/useInstantWager'
import LotterySelector from './LotterySelector.vue'
import { formatMoney } from '@/utils/number'
import { useIcon } from '@/hooks/web/useIcon'
import HandicapRadio from '@/views/Account/components/HandicapRadio.vue'
import DrawResult from './DrawResult.vue'
import StatisticsDrawer from './StatisticsDrawer.vue'
import TrickButtonGroup from './TrickButtonGroup.vue'

import { type LotteryDrawItem, LotteryDrawStatus } from '@/api/drawingResult/types'
import type { LotteryItem } from '@/api/account/types'
import type { LotteryTrickItem } from '@/api/instantWager/types'

const refreshIcon = useIcon({ icon: 'svg-icon:refresh' })

const props = defineProps<{
  lotteryList: LotteryItem[]
  trickList: LotteryTrickItem[]
  lotteryCode: string | undefined
  handicapCode: string | undefined
  periodsNumber: number | undefined
  playTypeCode: string | undefined
  showTotalAmount: boolean
  refreshing: boolean
}>()
const emit = defineEmits([
  'update:lotteryCode',
  'refresh',
  'update:handicapCode',
  'update:playTypeCode',
  'update:showTotalAmount',
  'update:periodsNumber'
])

const gameCode = computed({
  get() {
    return props.lotteryCode
  },
  set(val) {
    emit('update:lotteryCode', val)
  }
})

// 刷新倒计时
const second = 1000
const refreshTimeout = ref(0)
const refreshCountdown = ref(0)
let refreshTimer: NodeJS.Timeout
const clearTimer = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
}
// 刷新回调
const handleRefresh = () => {
  const code = gameCode.value
  emit('refresh', { lotteryCode: code, handicapCode: handicap.value })
  getLotteryDrawInfo(code)
}
watch(refreshTimeout, (newTimeout) => {
  clearTimer()
  if (newTimeout) {
    refreshCountdown.value = newTimeout
    refreshTimer = setInterval(() => {
      refreshCountdown.value = refreshCountdown.value - 1
      if (refreshCountdown.value === 0) {
        refreshCountdown.value = newTimeout
        handleRefresh()
      }
    }, second)
  }
})
onUnmounted(() => {
  clearTimer()
})

// 开奖记录
const drawList = ref<LotteryDrawItem[]>([])
// 本期
const currentDrawInfo = computed(() => {
  return drawList.value.find((info) => {
    return info.periodsNumber === props.periodsNumber
  })
})
// 上一期
const lastDrawInfo = ref<LotteryDrawItem>()
// 获取彩票开奖信息
const getLotteryDrawInfo = async (code?: string) => {
  if (!code) return
  const { data } = await queryLotteryDrawingInfo({ lotteryCode: code, current: 1, size: 10 })
  const currentPeriod = unref(periodNum)
  // 如果当前期数存在且存在在列表中，保留当前期数
  if (currentPeriod && data.data?.find((item) => item.periodsNumber === currentPeriod)) {
    emit('update:periodsNumber', currentPeriod)
  } else {
    emit('update:periodsNumber', data.data[0]?.periodsNumber)
  }
  lastDrawInfo.value = data.data[1]
  drawList.value = data.data
}
const periodNum = computed({
  get() {
    return props.periodsNumber
  },
  set(val) {
    emit('update:periodsNumber', val)
  }
})

// 开奖/开盘倒计时结束
const handleCountdownFinish = () => {
  const code = gameCode.value
  getLotteryDrawInfo(code)
}
const LotteryDrawStatusEnums = {
  [LotteryDrawStatus.Open]: '开盘中',
  [LotteryDrawStatus.Drawing]: '开奖中',
  [LotteryDrawStatus.Maintaining]: '维护中'
}
/* const ShowStatus = [
  LotteryDrawStatus.Open,
  LotteryDrawStatus.Maintaining,
  LotteryDrawStatus.Drawing
] */
const showStatusInfo = computed(() => {
  const status = currentDrawInfo.value?.status
  // return Number.isInteger(status) && ShowStatus.includes(status!)
  return Number.isInteger(status)
})

const lotteryChanging = ref(false)
const handleLotteryChange = () => {
  lotteryChanging.value = true
}

watch(
  () => props.trickList,
  (newList) => {
    if (newList?.length) {
      lotteryChanging.value = false
    }
  }
)

watch(
  gameCode,
  (newCode) => {
    getLotteryDrawInfo(newCode)
  },
  { immediate: true }
)

// 盘口号
const handicap = computed({
  get() {
    return props.handicapCode
  },
  set(val) {
    emit('update:handicapCode', val)
  }
})

const handicapList = computed(() => {
  const item = props.lotteryList.find((lottery) => lottery.lotteryCode === gameCode.value)
  const list = item?.sysHandicapList || []
  return list
})

// 盘口号 end

// 今日输赢
const todayWinLoss = computed(() => {
  const precision = 2
  return props.trickList
    .reduce((sum, item) => {
      return sum + item.profitAndLossAmount
    }, 0)
    .toFixed(precision)
})

// 统计数据抽屉
const statisticsShow = ref(false)
const showStatisticsDrawer = () => {
  statisticsShow.value = true
}

// 玩法
const currentTrick = computed({
  get() {
    return props.playTypeCode
  },
  set(val) {
    emit('update:playTypeCode', val)
  }
})

// 显示总额
const showTotal = computed({
  get() {
    return props.showTotalAmount || false
  },
  set(val) {
    emit('update:showTotalAmount', val)
  }
})
</script>
<template>
  <div class="wager-header">
    <div class="wager-header-first wager-header-line">
      <div class="lottery-selector">
        当前选中：
        <LotterySelector
          v-model="gameCode"
          :lottery-list="lotteryList"
          @change="handleLotteryChange"
        />
      </div>
      <TrickButtonGroup
        v-model="currentTrick"
        v-loading="lotteryChanging"
        :trickList="trickList"
        :lotteryCode="gameCode"
      />
    </div>
    <div class="wager-header-line lottery-periods">
      <div class="lottery-current">
        <ElSelect
          v-if="drawList?.length"
          v-model="periodNum"
          :style="{
            width: periodNum
              ? `calc(${String(periodNum).length + 0.5} * var(--el-select-font-size) )`
              : `7em`,
            minWidth: '7em'
          }"
          class="mr-3"
          :fit-input-width="false"
        >
          <ElOption
            v-for="item in drawList"
            :key="item.periodsNumber"
            :label="item.periodsNumber"
            :value="item.periodsNumber"
          />
        </ElSelect>
        <span v-if="showStatusInfo" class="lottery-current-status mr-3">
          {{ LotteryDrawStatusEnums[currentDrawInfo!.status] }}
          {{ currentDrawInfo?.status === LotteryDrawStatus.Open ? '距封盘' : '距开奖' }}
          :
          <span class="ml-1">
            <ElCountdown
              v-if="
                currentDrawInfo?.autoCloseDate && currentDrawInfo?.status === LotteryDrawStatus.Open
              "
              :value="new Date(currentDrawInfo.autoCloseDate).getTime()"
              @finish="handleCountdownFinish"
            />
            <ElCountdown
              v-else-if="currentDrawInfo?.drawingDate"
              :value="new Date(currentDrawInfo.drawingDate).getTime()"
              @finish="
                currentDrawInfo.status === LotteryDrawStatus.Drawing && handleCountdownFinish
              "
            />
          </span>
        </span>
        <span class="mr-3">
          今日输赢:
          <span style="color: var(--el-color-primary)">
            {{ formatMoney(todayWinLoss) }}
          </span>
        </span>
        <span>
          <ElCheckbox v-model="showTotal" label="显示总额(虛注)" size="large" />
        </span>
      </div>
      <div v-if="lastDrawInfo" class="lottery-last">
        <span>
          上一期
          <span class="period-num mr-1">
            {{ lastDrawInfo.periodsNumber }}
          </span>
        </span>
        <span class="draw-result">
          <span class="mr-2">开奖结果:</span>
          <DrawResult :draw-info="lastDrawInfo" />
        </span>
        <div class="lottery-refresh ml-5">
          <ElButton
            type="primary"
            class="mr-2 w-8"
            :icon="refreshIcon"
            :loading-icon="refreshIcon"
            :loading="refreshing"
            @click="handleRefresh"
          />
          <span v-if="refreshTimeout" class="mr-2">{{ formatNumPadding(refreshCountdown) }}秒</span>
          <ElSelect v-model="refreshTimeout" class="refresh-selector" :fit-input-width="true">
            <ElOption
              v-for="item in refreshOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </div>
      </div>
    </div>
    <div class="wager-header-line flex justify-between items-center">
      <HandicapRadio v-model="handicap" class="handicap-radio" :list="handicapList" />
      <ElButton :loading="refreshing" @click="showStatisticsDrawer">统计数据</ElButton>
    </div>
  </div>
  <StatisticsDrawer v-model="statisticsShow" :list="trickList" :lotteryCode="gameCode" />
</template>
<style lang="less" scoped>
@import url('../styles/wagerHeader.less');
</style>
