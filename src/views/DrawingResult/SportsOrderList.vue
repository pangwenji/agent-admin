<script setup lang="tsx">
/* eslint-disable no-magic-numbers */

import { Search } from '@/components/Search'
import { Table } from '@/components/Table'
import { ActionDialog } from '@/components/ActionDialog'
import { DataDetail } from '@/components/DataDetail'

import { useRoute } from 'vue-router'

import PercentDetail from './components/PercentDetail.vue'

import { DrawingOrderType, useDrawingOrderList } from './tools'

const route = useRoute()
const {
  setSearchParams,
  allSchemas,
  tableState,
  tableRegister,
  dialogState,
  currentRow,
  percentData
} = useDrawingOrderList(DrawingOrderType.Sports)
const { loading, dataList, total, currentPage, pageSize } = tableState
const { dialogVisible, dialogType, dialogTitle, closeDialog, getDialogConfirm, dialogWidth } =
  dialogState
</script>

<template>
  <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams" />
  <Table
    v-if="route.query.matchId"
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
    row-key="orderDetailNo"
    @register="tableRegister"
  />

  <ActionDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :confirm="getDialogConfirm"
    :close="closeDialog"
    :width="dialogWidth"
  >
    <DataDetail
      v-if="dialogType === 'detail'"
      :detail-schema="allSchemas.detailSchema"
      :current-row="currentRow"
    />
    <PercentDetail v-else-if="dialogType === 'percent'" :percentDetailData="percentData" />
  </ActionDialog>
</template>
<style lang="less" scoped>
@import url('./styles/gameNote.less');
</style>
