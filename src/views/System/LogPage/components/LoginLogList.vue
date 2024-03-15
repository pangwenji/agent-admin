<script setup lang="tsx">
import { ref, unref, reactive } from 'vue'
import { ElButton } from 'element-plus'

import { Search } from '@/components/Search'
import { Table } from '@/components/Table'
import { ActionDialog } from '@/components/ActionDialog'
import { DataDetail } from '@/components/DataDetail'

import { getLoginLogList } from '@/api/system/log'
import { useTable } from '@/hooks/web/useTable'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { LoginLogData } from '@/api/system/log/types'
import { SwitchStatus } from '@/enum'

const loginCrudSchemas = reactive<CrudSchema[]>([
  {
    field: 'id',
    label: 'ID',
    width: '120px',
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
    field: 'account',
    label: '账号',
    width: '220px',
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
    field: 'domainName',
    label: '域名',
    search: {
      hidden: true
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'isSuccess',
    label: '狀態',
    width: '180px',
    search: {
      hidden: true
    },
    slots: {
      default: (data: { row: LoginLogData }) => {
        if (!data.row) return '-'
        return <>{data?.row?.isSuccess === SwitchStatus.Open ? '登录成功' : '登录失败'}</>
      }
    },
    detail: {
      slots: {
        default: (data: LoginLogData) => {
          return <>{data.isSuccess === SwitchStatus.Open ? '登录成功' : '登录失败'}</>
        }
      },
      span: 24
    }
  },
  {
    field: 'ipAddr',
    label: 'IP',
    search: {
      hidden: true
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'createTime',
    label: '時間',
    width: '168px',
    search: {
      hidden: true
    },
    detail: {
      span: 24
    }
  }
])

const allSchemas = useCrudSchemas(loginCrudSchemas).allSchemas

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getLoginLogList({
      current: unref(currentPage),
      size: unref(pageSize),
      ...unref(searchParams)
    })
    return {
      list: res.data.records,
      total: res.data.total
    }
  }
})

const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList } = tableMethods

const searchParams = ref({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

const dialogVisible = ref(false)
const dialogTitle = ref('')
const closeDialog = () => {
  dialogVisible.value = false
}

const currentRow = ref<LoginLogData | null>(null)

const action = (row: LoginLogData) => {
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
