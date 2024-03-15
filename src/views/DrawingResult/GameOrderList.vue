<script setup lang="tsx">
/* eslint-disable no-magic-numbers */
import { ElRadioButton } from 'element-plus'

import { Search } from '@/components/Search'
import { Table } from '@/components/Table'
import { ActionDialog } from '@/components/ActionDialog'
import { DataDetail } from '@/components/DataDetail'

import { useRoute } from 'vue-router'

import PercentDetail from './components/PercentDetail.vue'

import { useDrawingOrderList } from './tools'
const route = useRoute()
const {
  settledOptions,
  settlesStatus,
  setSearchParams,
  allSchemas,
  tableState,
  tableRegister,
  dialogState,
  currentRow,
  percentData
} = useDrawingOrderList() as any
const { loading, dataList, total, currentPage, pageSize } = tableState
const { dialogVisible, dialogType, dialogTitle, closeDialog, getDialogConfirm, dialogWidth } =
  dialogState
</script>

<template>
  <div class="flex">
    <ElRadioGroup v-model="settlesStatus" class="settled-radio">
      <ElRadioButton v-for="option in settledOptions" :key="option.label" :label="option.value">
        {{ option.label }}
      </ElRadioButton>
    </ElRadioGroup>
    <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams"
  /></div>
  <Table
    v-if="route.query.lotteryCode"
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
    <p v-else-if="dialogType === 'flyOpen'">确认将本注单的占成交给上一级?</p>
    <p v-else-if="dialogType === 'cancel'">确认取消当前注单?</p>
  </ActionDialog>
</template>
<style lang="less" scoped>
@import url('./styles/gameNote.less');
</style>
