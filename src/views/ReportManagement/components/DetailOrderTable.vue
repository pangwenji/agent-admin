<script lang="tsx" setup>
import { ref, unref, reactive, defineProps } from 'vue'
import { Table, TableColumn } from '@/components/Table'
import { Search } from '@/components/Search'
import {
  getLotteryDetailReport,
  getSportsDetailReport,
  getVideoDetailReport
} from '@/api/reportManagement'
import { useTable } from '@/hooks/web/useTable'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { TimeRangeColKey } from '@/hooks/web/useReportManagement'
import {
  ReportGameType,
  type ReportDetailSearchParams,
  type ReportDetailSummaryItem
} from '@/api/reportManagement/types'
import { formatCommonTime } from '@/utils'
type Props = {
  columns: CrudSchema[]
  currentGameType: ReportGameType
  playerId: string
}
const props = defineProps<Props>()

const allSchemas = useCrudSchemas(props.columns).allSchemas
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const originSearchParams = unref(searchParams)
    const gameType = unref(props.currentGameType)
    const detailApi =
      gameType === ReportGameType.Lottery
        ? getLotteryDetailReport
        : gameType === ReportGameType.Sports
          ? getSportsDetailReport
          : getVideoDetailReport
    const res = await detailApi({
      current: unref(currentPage),
      size: unref(pageSize),
      playerId: props.playerId,
      ...(!!originSearchParams[TimeRangeColKey]?.length && {
        startTime: formatCommonTime(originSearchParams[TimeRangeColKey]?.[0]),
        endTime: formatCommonTime(originSearchParams[TimeRangeColKey]?.[1])
      })
    })
    summaryList[0] = {
      ...res.data.pageSum,
      type: '小计'
    }
    summaryList[1] = {
      ...res.data.allSum,
      type: '合计'
    }
    return {
      list: res.data.records,
      total: res.data.total
    }
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList } = tableMethods
const searchParams = ref<ReportDetailSearchParams>(
  allSchemas.searchSchema.reduce((res, schema) => {
    return {
      ...res,
      ...(schema.value !== undefined && { [schema.field]: schema.value })
    }
  }, {})
)
const setSearchParams = (params: ReportDetailSearchParams) => {
  searchParams.value = params
  getList()
}

const summaryList = reactive<ReportDetailSummaryItem[]>([])
const totalTitle: TableColumn[] = [
  { label: '合计类型', field: 'type', width: 100 },
  { label: '注单数量', field: 'orderCount', width: 300 },
  { label: '投注金额', field: 'betAmount', width: 300 },
  { label: '有效投注', field: 'effectiveBet', width: 300 },
  { label: '派彩金额', field: 'rewardAmount', width: 300 }
]
</script>
<!-- eslint-disable vue/require-default-prop -->
<template>
  <Search
    :key="currentGameType"
    :schema="allSchemas.searchSchema"
    @search="setSearchParams"
    @reset="setSearchParams"
  />
  <Table
    :key="currentGameType"
    v-model:pageSize="pageSize"
    v-model:currentPage="currentPage"
    :columns="allSchemas.tableColumns"
    :data="dataList"
    :loading="loading"
    :pagination="{
      total: total
    }"
    wrapper-shadow
    @register="tableRegister"
  >
    <template #append>
      <Table
        :columns="totalTitle"
        :data="summaryList"
        :loading="loading"
        class="detail-order-summary"
        @scroll.stop
      />
    </template>
  </Table>
</template>
<style lang="less" scoped>
@import url('./detailOrderTable.less');
</style>
