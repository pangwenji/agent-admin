<script setup lang="tsx">
import { reactive, defineProps } from 'vue'

import { Table, TableColumn } from '@/components/Table'

import { PercentDetailData } from '@/api/drawingResult/types'
import { computed } from 'vue'

const props = defineProps<{ percentDetailData?: PercentDetailData }>()

const dataList = computed(() => {
  if (!props.percentDetailData) return []
  const row = Object.entries(props.percentDetailData).reduce((res, [key, detailItem]) => {
    const targetCol = tableColumns.find((col) => col.field === key)
    if (targetCol && typeof detailItem?.percentage === 'number') {
      const scale = 1000
      targetCol.label = `${targetCol.label}/${(detailItem?.percentage * scale) / 10}%`
    }
    return {
      ...res,
      [key]: detailItem?.agentAccount || '-'
    }
  }, {})
  return [row]
})

const tableColumns = reactive<TableColumn[]>([
  {
    field: 'branchOrderPercentageVO',
    label: '分公司'
  },
  {
    field: 'oneOrderPercentageVO',
    label: '一级代理'
  },
  {
    field: 'twoOrderPercentageVO',
    label: '二级代理'
  },
  {
    field: 'threeOrderPercentageVO',
    label: '三级代理'
  }
])
</script>

<template>
  <Table :columns="tableColumns" :data="dataList" :loading="!dataList.length" />
</template>
