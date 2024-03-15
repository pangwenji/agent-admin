<script setup lang="tsx">
import { ref, unref, reactive } from 'vue'
import { ElButton } from 'element-plus'

import { Search } from '@/components/Search'
import { Table } from '@/components/Table'
import { ActionDialog } from '@/components/ActionDialog'
import { DataDetail } from '@/components/DataDetail'

import { useTable } from '@/hooks/web/useTable'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { getOperateLogList } from '@/api/system/log'
import { OperateLogData } from '@/api/system/log/types'

const operateCrudSchemas = reactive<CrudSchema[]>([
  {
    field: 'id',
    label: '编号',
    width: '168px',
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    detail: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          return (
            <ElButton type="primary" class="w-full" link onClick={() => action(data.row)}>
              {data.row.id}
            </ElButton>
          )
        }
      }
    }
  },
  {
    field: 'operate',
    label: '类型',
    search: {
      hidden: true
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'userName',
    label: '操作账号',
    width: '250px',
    search: {
      component: 'Input'
    },
    form: {
      component: 'Input',
      colProps: {
        span: 24
      }
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'createTime',
    label: '变更日期',
    width: '168px',
    search: {
      hidden: true
    },
    form: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetime',
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'ipAddress',
    label: 'IP',
    width: '350px',
    search: {
      hidden: true
    }
  }
])

const allSchemas = useCrudSchemas(operateCrudSchemas).allSchemas

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const params = unref(searchParams)
    const res = await getOperateLogList({
      current: unref(currentPage),
      size: unref(pageSize),
      account: params.userName
    })
    return {
      list: res.data.records,
      total: res.data.total
    }
  }
})

const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList } = tableMethods

const searchParams = ref<Partial<OperateLogData>>({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

const dialogVisible = ref(false)
const dialogTitle = ref('')
const closeDialog = () => {
  dialogVisible.value = false
}

const currentRow = ref<OperateLogData | null>(null)

const action = (row: OperateLogData) => {
  dialogTitle.value = '详情'
  currentRow.value = row
  dialogVisible.value = true
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
    @register="tableRegister"
  />

  <ActionDialog v-model="dialogVisible" :title="dialogTitle" :close="closeDialog">
    <DataDetail :detail-schema="allSchemas.detailSchema" :current-row="currentRow" />
  </ActionDialog>
</template>
