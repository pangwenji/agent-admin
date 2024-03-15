<script setup lang="ts">
import { ref, onMounted, reactive, watch, provide, toRaw, unref, computed } from 'vue'
import { getLotteryListApi } from '@/api/account'
import { queryLotteryOddsApi, updateLotteryOdds } from '@/api/instantWager'
import {
  InstantWagerRootKey,
  calFloatNum,
  formatBTCLotteryOddsList,
  formatJND45LotteryOddsList,
  formatLHCLotteryOddsList,
  formatPCNNLotteryOddsList,
  formatQXCLotteryOddsList,
  useInstantWagerChange
} from '@/hooks/web/useInstantWager'
import WagerHeader from './components/WagerHeader.vue'
import OddsTableList from './components/OddsTableList.vue'
import type { LotteryItem } from '@/api/account/types'
import type {
  LotteryOddsItem,
  LotteryOddsParams,
  LotteryTrickItem,
  OddsListVOListItem
} from '@/api/instantWager/types'
import { ElMessage } from 'element-plus'
import WagerFooter from './components/WagerFooter.vue'
import { CommonRoutePaths } from '@/router'
import { useAgentInfoStore } from '@/store/modules/agentInfo'
import { AgentType } from '@/enum'
import { isEqual, pick } from 'lodash-es'

const lotteryList = ref<LotteryItem[]>([]) // 彩票列表
const lotteryCode = ref<string>() // 当前彩票
const isOddsOpen = ref(false) // 操作权限

// 获取个人信息，检查赔率操作权限
const agentInfoStore = useAgentInfoStore()
const getPersonInfo = async () => {
  const agentInfo = await agentInfoStore.getAgentInfo()
  if (!agentInfo) return
  const { agentType } = agentInfo!
  // 总公司不能更改赔率, 但是可以查看注单
  if (agentType === AgentType.Headquarters) {
    isOddsOpen.value = false
  } else {
    // 非总公司，检查配置
    isOddsOpen.value = Boolean(agentInfo.isOddOpen)
  }
}

// 获取所有彩票
const getLotteryList = async () => {
  const res = await getLotteryListApi()
  lotteryList.value = res.data
}
// 初始化彩票列表并选中第一个彩票
onMounted(async () => {
  await getPersonInfo()
  await getLotteryList()
  lotteryCode.value = lotteryList.value[0].lotteryCode
})

const loading = ref(true)
// 分页
const pageParams = reactive<Omit<LotteryOddsParams, 'lotteryCode'>>({
  current: 1,
  size: 100,
  handicapCode: undefined,
  periodsNumber: undefined
})

const lotteryOddsList = ref<LotteryOddsItem[]>([]) // 当前彩票赔率
// 监听上级赔率变动
const { changedOddsList } = useInstantWagerChange()

// 当前玩法
const playTypeCode = ref<string>()
// 过滤出当前选中玩法
const filterLotteryOddsList = computed(() => {
  let result = lotteryOddsList.value
  if (unref(playTypeCode) && lotteryOddsList.value?.length) {
    result = lotteryOddsList.value.filter((item) => item.playTypeCode === unref(playTypeCode))
  }
  // 处理上级赔率变动
  const ovlList = result[0]?.oddsListVOList
  changedOddsList.value?.forEach((changedOdds) => {
    const ovlIndex = ovlList.findIndex((ovlOdds) => {
      const props = [
        'lotteryCode',
        'handicapCode',
        'playTypeCode',
        'playTypeName',
        'playCode',
        'playName'
      ]
      return isEqual(pick(ovlOdds, props), pick(changedOdds, props))
    })
    if (ovlIndex > -1) {
      const ovlItem = ovlList[ovlIndex]
      ovlItem.odds = changedOdds.odds
    }
  })
  return result
})
const lotteryTrickStatistics = ref<LotteryTrickItem[]>([]) // 当前彩票玩法统计
// 玩法变动，情况选择
watch(playTypeCode, (newTypeCode) => {
  if (newTypeCode) {
    handleCancelSelect()
  }
})

// 获取游戏赔率列表
const getLotteryOddsList = async (code: string) => {
  loading.value = true
  try {
    const res = await queryLotteryOddsApi({
      ...pageParams,
      lotteryCode: code
    })

    const oddsList =
      code === 'QXC' // 合并七星彩玩法
        ? formatQXCLotteryOddsList(res.data.records)
        : code.endsWith('LHC') // 合并六合彩玩法
          ? formatLHCLotteryOddsList(res.data.records)
          : ['JNDSI', 'JNDWU'].includes(code) // 合并加拿大4.2-4.6 / 加拿大5.0
            ? formatJND45LotteryOddsList(res.data.records)
            : code === 'PCNN' // 合并 pcNN
              ? formatPCNNLotteryOddsList(res.data.records)
              : code.startsWith('BTC') //币安比特币
                ? formatBTCLotteryOddsList(res.data.records)
                : res.data.records

    lotteryOddsList.value = oddsList

    // 整理彩票玩法列表
    lotteryTrickStatistics.value = oddsList.map((item) => ({
      profitAndLossAmount: item.profitAndLossAmount,
      totalAmount: item.totalAmount,
      actualAmount: item.actualAmount,
      playTypeName: item.playTypeName,
      playTypeCode: item.playTypeCode,
      lotteryCode: item.lotteryCode
    }))
  } catch {
  } finally {
    loading.value = false
  }
}

// 盘口
const handicapCode = ref<string | undefined>()
// 期号
const periodsNumber = ref<number | undefined>()

// 重置分页数据
const initLotteryOdds = (newLotteryCode?: string) => {
  if (!newLotteryCode) return
  // 重置分页数据
  pageParams.current = 1
  // 清空选择项
  handleCancelSelect()
  getLotteryOddsList(newLotteryCode)
}
// 监听彩票和盘口和期号变动
watch(
  [lotteryCode, handicapCode, periodsNumber],
  async ([newLotteryCode, newHandicapCode, newPeriod], [oldLotteryCode]) => {
    if (!newLotteryCode) return
    let hCode = newHandicapCode
    if (newLotteryCode !== oldLotteryCode) {
      // 重置玩法
      // playTypeCode.value = undefined
      // 切换彩票并设置盘口
      hCode = lotteryList.value.find((item) => item.lotteryCode === newLotteryCode)
        ?.sysHandicapList?.[0]?.handicapCode
      handicapCode.value = hCode
      pageParams.handicapCode = hCode
      // 重置期号
      periodsNumber.value = undefined
      pageParams.periodsNumber = undefined
    } else if (newHandicapCode !== pageParams.handicapCode) {
      // 切换盘口
      pageParams.handicapCode = hCode
      initLotteryOdds(lotteryCode.value)
    } else if (newPeriod) {
      pageParams.periodsNumber = newPeriod
      initLotteryOdds(lotteryCode.value)
    }
  }
)

// 刷新:手动/自动
const handleRefresh = async (data: { lotteryCode: string; handicapCode: string }) => {
  await getLotteryList() // 更新游戏列表，存在盘口数据
  // 刷新保留盘口数据
  pageParams.handicapCode = data.handicapCode
  handicapCode.value = data.handicapCode
  // 已切换彩种不再执行
  if (data.lotteryCode === lotteryCode.value) {
    getLotteryOddsList(data.lotteryCode)
  }
}

// 表格内加减计算
const handleCalInTable = async (row: OddsListVOListItem, odds: number) => {
  const limitOdds = odds < 0 ? 0 : odds
  const oldOdds = row.odds
  row.odds = limitOdds
  handleUpdateOdds([row], [oldOdds])
}

// 表格内跳转详细注单
const gotoDetailOrder = () => {
  if (!lotteryCode.value) return
  window.open(`#${CommonRoutePaths.GameOrder}?lotteryCode=${lotteryCode.value}`)
}

// 当前选择数组
const selectedRowList = reactive<OddsListVOListItem[]>([])
// 选择某行
const selectRow = (row: OddsListVOListItem) => {
  // 没有权限
  if (!isOddsOpen.value) return
  const targetIndex = selectedRowList.findIndex((sRow) => sRow.id === row.id)
  if (targetIndex > -1) {
    selectedRowList.splice(targetIndex, 1)
  } else {
    selectedRowList.push(row)
  }
}

// footer 操作
const allRowList = computed(() => {
  return (unref(filterLotteryOddsList)
    ?.map((oddsItem) => oddsItem.oddsListVOList)
    .flat() || []) as OddsListVOListItem[]
})
// 变动后重新关联选择项
watch(allRowList, (newAllRowList) => {
  if (!newAllRowList.length) return
  selectedRowList.forEach((sRow, sRowIndex) => {
    const newRow = newAllRowList.find((row) => row.id === sRow.id)
    if (newRow) {
      selectedRowList[sRowIndex] = newRow
    }
  })
})
// 全选
const handleSelectAll = () => {
  selectedRowList.splice(0, selectedRowList.length, ...unref(allRowList))
  console.log('all => ', selectedRowList)
}
// 反选
const handleSelectReverse = () => {
  const unselectedRowList = unref(allRowList).filter((row) => {
    return !selectedRowList.find((sRow) => sRow.id === row.id)
  })
  selectedRowList.splice(0, selectedRowList.length, ...unselectedRowList)
  console.log('reverse => ', selectedRowList)
}
// 取消选择
const handleCancelSelect = () => {
  selectedRowList.splice(0)
}
// footer 变动赔率
const handleCalInFooter = async (calOdds: number) => {
  if (!selectedRowList?.length) {
    ElMessage.warning('请选择其中一条或者多条')
    return
  }
  const oldOddsList = selectedRowList.map((row) => {
    const oldOdds = row.odds
    const newOdds = calFloatNum(oldOdds, calOdds)
    row.odds = newOdds < 0 ? 0 : newOdds
    return oldOdds
  })
  handleUpdateOdds(selectedRowList, oldOddsList)
}
const handleInputInFooter = async (odds: number) => {
  if (!selectedRowList?.length) {
    ElMessage.warning('请选择其中一条或者多条')
    return
  }
  const oldOddsList = selectedRowList.map((row) => {
    const oldOdds = row.odds
    row.odds = odds < 0 ? 0 : odds
    return oldOdds
  })
  handleUpdateOdds(selectedRowList, oldOddsList)
}
const handleUpdateOdds = async (list: OddsListVOListItem[], oldOddsList: number[]) => {
  try {
    await updateLotteryOdds([...toRaw(list)])
    ElMessage.success('更改成功')
  } catch {
    // 恢复原值
    list.forEach((row, rowIndex) => {
      row.odds = oldOddsList[rowIndex]
    })
    ElMessage.success('更改失败')
  }
}

// 显示虚注（总额）
const showTotalAmount = ref(false)

// 处理表格内数据注入
provide(InstantWagerRootKey, {
  handleCalInTable,
  isOddsOpen,
  gotoDetailOrder,
  selectRow,
  selectedRowList,
  showTotalAmount
})
</script>
<template>
  <div
    v-if="agentInfoStore.info"
    v-loading="!lotteryOddsList?.length"
    :class="[
      'instant-wager',
      {
        'h-[calc(100vh-var(--app-footer-height)-var(--top-tool-height)-var(--app-content-padding)*2)]': true
      }
    ]"
  >
    <WagerHeader
      v-model:lotteryCode="lotteryCode"
      v-model:handicapCode="handicapCode"
      v-model:playTypeCode="playTypeCode"
      v-model:showTotalAmount="showTotalAmount"
      v-model:periodsNumber="periodsNumber"
      :lottery-list="lotteryList"
      :trickList="lotteryTrickStatistics"
      :refreshing="loading"
      @refresh="handleRefresh"
    />
    <div :class="['wager-odds-area', { '!pb-0': !isOddsOpen }]">
      <OddsTableList :key="lotteryCode" :trickOddsList="filterLotteryOddsList" />
    </div>
    <WagerFooter
      v-if="isOddsOpen"
      class="wager-footer"
      @select-all="handleSelectAll"
      @select-reverse="handleSelectReverse"
      @cancel-select="handleCancelSelect"
      @calculate="handleCalInFooter"
      @input-odds="handleInputInFooter"
    />
  </div>
</template>
<style lang="less" scoped>
.instant-wager {
  --footer-height: 68px;
  --header-v-space: 8px;
  --page-offset: calc(var(--app-content-padding) - var(--header-v-space));
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  margin-top: calc(-1 * var(--page-offset));
  .wager-odds-area {
    padding-bottom: calc(var(--footer-height) - var(--app-content-padding) - var(--page-offset));
    flex: 1;
    overflow: auto;
    width: 100%;
    background-color: rgba(72, 71, 96, 0.05);
  }
  .wager-footer {
    width: 100%;
    height: var(--footer-height);
    position: absolute;
    bottom: calc(-1 * var(--app-content-padding) - var(--page-offset));
    left: calc(-1 * var(--app-content-padding));
    background-color: #fff;
    z-index: 3;
  }
}
</style>
