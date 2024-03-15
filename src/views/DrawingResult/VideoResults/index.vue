<script setup lang="tsx">
/* eslint-disable no-magic-numbers */
import { ref, unref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElButton, ElMessage, ElRadioButton } from 'element-plus'

import { useTable } from '@/hooks/web/useTable'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'

import { createMoneyCols } from '@/utils/table'
import { LotteryItem } from '@/api/account/types'
import { getLotteryListApi } from '@/api/account'
import { queryLotteryDrawingInfo } from '@/api/drawingResult'
import { LotteryDrawItem } from '@/api/drawingResult/types'
import { CommonRoutePaths } from '@/router'
import { Search } from '@/components/Search'
import { Table } from '@/components/Table'
import DrawResult from '@/views/InstantWager/components/DrawResult.vue'

const router = useRouter()

const resultCrudSchemas = reactive<CrudSchema[]>([
  {
    field: '游戏牌桌',
    label: '游戏牌桌',
    width: '120px'
  },
  {
    field: '局号',
    label: '局号',
    minWidth: '168px',
    search: {
      hidden: true
    }
  },
  {
    field: 'startBillTime',
    label: '开奖时间',
    minWidth: '168px',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default({ row }: { row: LotteryDrawItem }) {
          // 兼容
          return row.startBillTime || row.drawingDate
        }
      }
    }
  },
  {
    field: 'drawingResult',
    label: '开奖结果',
    minWidth: '300px',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default({ row }: { row: LotteryDrawItem }) {
          return row.drawingResult && currentLotteryCode.value ? (
            <DrawResult class="w-full justify-center" drawInfo={row} />
          ) : (
            '-'
          )
        }
      }
    }
  },
  {
    field: 'betNum',
    label: '注单数量',
    minWidth: '168px',
    search: {
      hidden: true
    }
  },
  {
    field: 'betPeople',
    label: '投注人数',
    minWidth: '168px',
    search: {
      hidden: true
    }
  },
  ...createMoneyCols([
    {
      field: 'totalAmount',
      label: '投注总额',
      minWidth: '168px',
      search: {
        hidden: true
      }
    },
    {
      field: 'rewardAmount',
      label: '派彩总额',
      minWidth: '168px',
      search: {
        hidden: true
      }
    },
    {
      field: 'winLoseAmount',
      label: '系统盈亏',
      minWidth: '168px',
      search: {
        hidden: true
      }
    }
  ]),
  {
    field: 'action',
    label: '操作',
    minWidth: 140,
    fixed: 'right',
    className: 'action-col',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default({ row }: { row: LotteryDrawItem }) {
          return (
            <ElButton
              type="primary"
              text
              class="w-full"
              disabled={!row.betNum}
              onClick={() => goToOrderList(row.periodsNumber)}
            >
              查看注单
            </ElButton>
          )
        }
      }
    }
  }
])

const allSchemas = useCrudSchemas(resultCrudSchemas).allSchemas

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const lotteryCode = unref(currentLotteryCode)
    if (!lotteryCode) return { list: [], total: 0 }
    const { currentPage, pageSize } = tableState
    const params = unref(searchParams)
    if (params?.periodsNumber?.trim() && Number.isNaN(Number(params.periodsNumber.trim()))) {
      ElMessage.error('请输入正确的期数')
      return {
        total: unref(tableState.total),
        list: unref(tableState.dataList)
      }
    }
    const res = await queryLotteryDrawingInfo({
      current: unref(currentPage),
      size: unref(pageSize),
      lotteryCode,
      ...params
    })
    return {
      list: res.data.data,
      total: res.data.total
    }
  }
})

const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList } = tableMethods

const searchParams = ref()
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

// 查看注单
const goToOrderList = async (periodsNumber: number) => {
  router.push({
    path: CommonRoutePaths.GameOrder,
    query: { periodsNumber, lotteryCode: unref(currentLotteryCode) }
  })
}

const lotteryList = ref<LotteryItem[]>([])
const initGetLotterPlay = async () => {
  const res = await getLotteryListApi()
  lotteryList.value = res.data
  currentLotteryCode.value = res.data[0].lotteryCode
}

const currentLotteryCode = ref<string>()
// 切换订单状态，表单重置
watch(currentLotteryCode, (newCode: string) => {
  if (!newCode) return
  currentLotteryCode.value = newCode
  searchParams.value = undefined
  tableMethods.refreshNReset()
})
onMounted(() => {
  initGetLotterPlay()
})
</script>

<template>
  <div v-loading="!currentLotteryCode" class="flex flex-wrap">
    <ElRadioGroup v-model="currentLotteryCode" class="lottery-radio">
      <ElRadioButton
        v-for="lottery in lotteryList"
        :key="lottery.lotteryCode"
        :label="lottery.lotteryCode"
      >
        {{ lottery.lotteryName }}
      </ElRadioButton>
    </ElRadioGroup>
    <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams"
  /></div>
  <Table
    v-if="currentLotteryCode"
    v-model:pageSize="pageSize"
    v-model:currentPage="currentPage"
    :columns="allSchemas.tableColumns"
    :data="dataList"
    :loading="loading"
    :pagination="{
      total: total
    }"
    wrapper-shadow
    class="gameNote-table"
    @register="tableRegister"
  />
</template>
<style lang="less" scoped>
.lottery-radio {
  margin: 0 16px 16px 0;
  flex-wrap: nowrap;
  overflow-x: auto;
}
</style>
