<script setup lang="tsx">
/* eslint-disable no-magic-numbers */
import { ref, unref, defineProps } from 'vue'

import { useTable } from '@/hooks/web/useTable'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'

import { querySportsDrawingInfo } from '@/api/drawingResult'
import { SportsDrawingType } from '@/api/drawingResult/types'
import { Search } from '@/components/Search'
import { Table } from '@/components/Table'

const props = defineProps<{ crudSchemaList: CrudSchema[]; sportsId: SportsDrawingType }>()

const resultCrudSchemas = props.crudSchemaList

const allSchemas = useCrudSchemas(resultCrudSchemas).allSchemas

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const params = unref(searchParams)
    /*  if (params?.periodsNumber?.trim() && Number.isNaN(Number(params.periodsNumber.trim()))) {
      ElMessage.error('请输入正确的期数')
      return {
        total: unref(tableState.total),
        list: unref(tableState.dataList)
      }
    } */
    const res = await querySportsDrawingInfo({
      current: unref(currentPage),
      size: unref(pageSize),
      sportsId: props.sportsId,
      ...params,
      matchName: params?.matchName || ''
    })
    return {
      list: res.data.records,
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
</script>

<template>
  <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams" />
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
    rowKey="orderNo"
    @register="tableRegister"
  />
</template>
