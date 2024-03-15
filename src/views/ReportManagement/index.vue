<template>
  <div v-if="currentTableType">
    <HeaderquartersHeader :data="breadcrumbList" />
    <ReportTable
      v-if="showReportList"
      :key="currentTableType"
      :table-columns="
        (isRef(RootTableMap[currentTableType].columns)
          ? (RootTableMap[currentTableType].columns as ComputedRef< CrudSchema[]>).value
          : RootTableMap[currentTableType].columns) as CrudSchema[]
      "
      :custom-list-params="{
        ...RootTableMap[currentTableType].listParams,
        gameType: currentGameType,
        agentId: agentConfigList[agentConfigList.length - 1]?.id
      }"
      @search-change="handleTableSearchChange"
    />
    <DetailOrderWrapper
      v-else
      :playerId="(RootTableMap[currentTableType].listParams!.playerId!)!"
      :startTime="RootTableMap[RootTableType.MemberDetail].listParams?.startTime"
      :endTime="RootTableMap[RootTableType.MemberDetail].listParams?.endTime"
      :gameType="currentGameType"
    />
  </div>
</template>
<script setup lang="tsx">
import { isRef } from 'vue'
import type { ComputedRef } from 'vue'

import { CrudSchema } from '@/hooks/web/useCrudSchemas'
import ReportTable from './components/ReportTable.vue'
import HeaderquartersHeader from './components/HeadquartersHeader.vue'
import { RootTableType, useReportTable } from '@/hooks/web/useReportTable'
import DetailOrderWrapper from './components/DetailOrderWrapper.vue'

const {
  showReportList,
  breadcrumbList,
  currentTableType,
  currentGameType,
  RootTableMap,
  agentConfigList,
  handleTableSearchChange
} = useReportTable()
</script>
