<script lang="tsx" setup>
/* eslint-disable no-magic-numbers */
import { ref, unref, computed, defineProps, defineAsyncComponent, toRaw, onMounted } from 'vue'
import { ElButton } from 'element-plus'
import { CrudSchema } from '@/hooks/web/useCrudSchemas'
import {
  detailedNoteTitle,
  TimeRangeColKey,
  ReportGameTypeOptions
} from '@/hooks/web/useReportManagement'
import { getLotteryListApi } from '@/api/account'
import type { LotteryItem } from '@/api/account/types'
import { ReportDetailItem, ReportGameType } from '@/api/reportManagement/types'
import DetailOrderTable from './DetailOrderTable.vue'
import { useAgentInfoStore } from '@/store/modules/agentInfo'
import { AgentType } from '@/enum'
import type { ReportTableParams } from '../types'
const SettlementDetails = defineAsyncComponent(() => import('./SettlementDetails.vue'))
type Props = Pick<ReportTableParams, 'startTime' | 'endTime' | 'gameType'> & {
  playerId: string
}
const props = defineProps<Props>()
const settlementRef = ref<InstanceType<typeof SettlementDetails> | null>(null)
// 查看结算明细权限
const agentInfoStore = useAgentInfoStore()
const canShowSettlement = computed(() => {
  const { agentType } = agentInfoStore.info || {}
  return agentType === AgentType.Headquarters || agentType === AgentType.Branch
})

const selectTypeKey = 'my-gameType'
const currentGameType = ref(props.gameType || ReportGameType.Lottery) // 默认体育

// 获取所有游戏
const lotteryList = ref<LotteryItem[]>([])
const getLotteryList = async () => {
  const res = await getLotteryListApi()
  lotteryList.value = res.data
}
onMounted(() => {
  getLotteryList()
})

const columns = computed<CrudSchema[]>(() => {
  const gameType = unref(currentGameType)
  // 处理不同分类的表格展示
  const isVideo = gameType === ReportGameType.Video
  const isSports = gameType === ReportGameType.Sports
  const isLottery = gameType === ReportGameType.Lottery

  const newCols = detailedNoteTitle.map((col, index): CrudSchema => {
    const newCol = col
    if (!isLottery && index === 2) {
      if (isVideo) {
        newCol.field = 'casino'
        newCol.label = '赌场'
      } else if (isSports) {
        newCol.field = 'gameName'
        newCol.label = '游戏/盘口'
      }
    } else if (!isLottery && index === 3) {
      if (isVideo) {
        newCol.field = 'tableName'
        newCol.label = '游戏牌桌'
      } else if (isSports) {
        newCol.field = 'gameTypeDetail'
        newCol.label = '联赛/主客'
      }
    }
    // 处理默认为上一次时间范围
    else if (col.field === TimeRangeColKey && newCol.search && props.startTime && props.endTime) {
      // 同步搜索栏
      newCol.search.value = [props.startTime, props.endTime]
    }
    return {
      search: { hidden: true },
      width: '220px',
      ...col
    }
  })

  // 彩票显示盘口
  if (isLottery) {
    const periodIndex = newCols.findIndex((col) => col.field === 'gamePeriod')
    if (periodIndex > -1) {
      newCols.splice(periodIndex + 1, 0, {
        label: '盘口',
        field: 'handicapCode',
        width: 80,
        slots: {
          default({ row }: { row: ReportDetailItem }) {
            const targetLottery = lotteryList.value.find(
              (lottery) => lottery.lotteryCode === row.lotteryCode
            )
            if (targetLottery) {
              const handicapLen = targetLottery.sysHandicapList?.length || 0
              return handicapLen < 2 ? '默认' : row.handicapCode
            }
            return row.handicapCode
          }
        }
      })
    }
  }

  // 查看结算明细
  if (canShowSettlement.value) {
    newCols.push({
      label: '结算',
      field: 'controls-btn',
      search: {
        hidden: false
      },
      fixed: 'right',
      width: 140,
      slots: {
        default({ row }) {
          return (
            <ElButton
              type="primary"
              onClick={() => {
                settlementRef.value?.open(toRaw(row))
              }}
            >
              结算明细
            </ElButton>
          )
        }
      }
    })
  }
  // 全部注单可选择游戏类型
  if (!props.gameType) {
    newCols.push({
      label: '游戏类型',
      field: selectTypeKey,
      table: {
        hidden: true
      },
      search: {
        component: 'Select',
        componentProps: {
          style: {
            width: '7em'
          },
          clearable: false,
          options: ReportGameTypeOptions,
          on: {
            change(value: ReportGameType) {
              currentGameType.value = value
              // refreshNReset()
            }
          }
        },
        value: currentGameType.value
      }
    })
  }
  return newCols
})
</script>
<!-- eslint-disable vue/require-default-prop -->
<template>
  <DetailOrderTable
    :key="currentGameType"
    :columns="columns"
    :currentGameType="currentGameType"
    :playerId="props.playerId"
  />
  <SettlementDetails ref="settlementRef" />
</template>
<style lang="less" scoped>
@import url('./detailOrderTable.less');
</style>
