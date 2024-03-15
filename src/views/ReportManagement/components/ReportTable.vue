<script lang="tsx" setup>
import { defineProps, ref, unref, computed, defineEmits, defineAsyncComponent } from 'vue'

import { useTable } from '@/hooks/web/useTable'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { TimeRangeColKey } from '@/hooks/web/useReportManagement'
import { getReportPage } from '@/api/reportManagement'
import { Table } from '@/components/Table'
import { Search } from '@/components/Search'

import type { PropType } from 'vue'
import { ReportRecordType, type ReportSearchParams } from '@/api/reportManagement/types'
import type { ReportTableParams } from '../types'
import { formatCommonTime } from '@/utils'
import { nextTick } from 'vue'
import { useAgentInfoStore } from '@/store/modules/agentInfo'
import { AgentType } from '@/enum'

const SettlementDetails = defineAsyncComponent(() => import('./SettlementDetails.vue'))

const settlementRef = ref<InstanceType<typeof SettlementDetails> | null>(null)
const props = defineProps({
  tableColumns: {
    type: Array as PropType<CrudSchema[]>,
    default: () => []
  },
  customListParams: {
    type: Object as PropType<ReportTableParams>,
    default: () => {}
  }
})
const emit = defineEmits(['searchChange'])

const columns = computed<CrudSchema[]>(() => {
  return props.tableColumns.map((col) => {
    const newCol = { ...col }
    // 处理默认为上一次时间范围
    if (
      col.field === TimeRangeColKey &&
      newCol.search &&
      props.customListParams.startTime &&
      props.customListParams.endTime
    ) {
      // 同步搜索栏
      newCol.search.value = [props.customListParams.startTime, props.customListParams.endTime]
    }
    return {
      search: { hidden: true },
      minWidth: '220px',
      ...newCol
    }
  })
})
const allSchemas = useCrudSchemas(columns.value).allSchemas
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const originSeachParams = unref(searchParams)
    const customListParams = {
      ...props.customListParams
    }
    const timeRangeSize = 2
    const timeRange = originSeachParams?.[TimeRangeColKey]
    const isTertiary = customListParams.isTertiary
    delete customListParams.isTertiary
    const res = await getReportPage({
      current: unref(currentPage),
      size: unref(pageSize),
      account: originSeachParams.account,
      ...(timeRange?.length === timeRangeSize && {
        startTime: formatCommonTime(timeRange[0]),
        endTime: formatCommonTime(timeRange[1])
      }),
      ...customListParams
    })
    return {
      list: isTertiary
        ? res.data.records.filter((record) => record.recordType === ReportRecordType.MemberAll)
        : res.data.records,
      total: res.data.total
    }
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList } = tableMethods

const searchParams = ref<ReportSearchParams>(
  allSchemas.searchSchema.reduce((res, schema) => {
    return {
      ...res,
      ...(schema.value !== undefined && { [schema.field]: schema.value })
    }
  }, {})
)
const setSearchParams = (params: ReportSearchParams) => {
  searchParams.value = params
  handleSearchChange(params)
  nextTick(() => {
    getList()
  })
}

// 监听搜索表单
const handleSearchChange = (searchParams: Recordable) => {
  emit('searchChange', searchParams)
}

// 查看结算明细权限
const agentInfoStore = useAgentInfoStore()
const canShowSettlement = computed(() => {
  const { agentType } = agentInfoStore.info || {}
  return agentType === AgentType.Headquarters || agentType === AgentType.Branch
})
</script>
<!-- eslint-disable vue/require-default-prop -->
<template>
  <div class="flex justify-between">
    <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams" />
    <ElButton v-if="canShowSettlement" type="primary" @click="settlementRef?.open">
      结算明细
    </ElButton>
  </div>
  <Table
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
  />
  <SettlementDetails ref="settlementRef" />
</template>
