<script setup lang="tsx">
import { ref, unref, reactive } from 'vue'
import { ElButton } from 'element-plus'

import { Search } from '@/components/Search'
import { Table } from '@/components/Table'
import { ActionDialog } from '@/components/ActionDialog'
import { DataDetail } from '@/components/DataDetail'

import { useTable } from '@/hooks/web/useTable'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { getTradeLogList } from '@/api/system/log'
import { TradeChangeType, TradeLogData } from '@/api/system/log/types'
import { formatMoneyWithPrecision } from '@/utils/number'

const TradeChangeTypeOptions = [
  { label: '全部账变', value: TradeChangeType.All },
  { label: '操作账变', value: TradeChangeType.Operate },
  { label: '投注账变', value: TradeChangeType.Bet }
]

const tradeCrudSchemas = reactive<CrudSchema[]>([
  {
    field: 'id',
    label: '编号',
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
    field: 'tradeChangeType',
    label: '类型',
    width: 120,
    search: {
      component: 'Select',
      componentProps: {
        style: {
          width: '7.5em'
        },
        clearable: false,
        options: TradeChangeTypeOptions
      },
      value: TradeChangeType.All
    },
    form: {
      hidden: true
    },
    detail: {
      hidden: true
    },
    slots: {
      default({ row }: { row: TradeLogData }) {
        const targetOption = TradeChangeTypeOptions.find((opt) => opt.value === row.tradeChangeType)
        return targetOption?.label || row.tradeChangeType
      }
    }
  },
  {
    field: 'agentAccount',
    label: '账号',
    width: '180px',
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
    field: 'beforeBalance',
    label: '账变前值',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          return <>余额: {formatMoneyWithPrecision(data.row.beforeBalance)}</>
        }
      }
    },
    detail: {
      span: 24,
      slots: {
        default: (data: any) => {
          return <>余额: {formatMoneyWithPrecision(data.beforeBalance)}</>
        }
      }
    }
  },
  {
    field: 'tradeAmount',
    label: '变化值',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          return <>变化: {formatMoneyWithPrecision(data.row.tradeAmount)}</>
        }
      }
    },
    detail: {
      span: 24,
      slots: {
        default: (data: any) => {
          return <>余额: {formatMoneyWithPrecision(data.tradeAmount)}</>
        }
      }
    }
  },
  {
    field: 'afterBalance',
    label: '账变后值',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          return <>余额: {formatMoneyWithPrecision(data.row.afterBalance)}</>
        }
      }
    },
    detail: {
      span: 24,
      slots: {
        default: (data: any) => {
          return <>余额: {formatMoneyWithPrecision(data.afterBalance)}</>
        }
      }
    }
  },
  {
    field: 'createTime',
    label: '账变日期',
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
    }
  }
])

const allSchemas = useCrudSchemas(tradeCrudSchemas).allSchemas

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const params = unref(searchParams)
    const res = await getTradeLogList({
      current: unref(currentPage),
      size: unref(pageSize),
      account: params.agentAccount || '',
      ...(params.tradeChangeType !== TradeChangeType.All && {
        tradeChangeType: params.tradeChangeType
      })
    })
    return {
      list: res.data.records,
      total: res.data.total
    }
  }
})

const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList } = tableMethods

const searchParams = ref<any>({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

const dialogVisible = ref(false)
const dialogTitle = ref('')
const closeDialog = () => {
  dialogVisible.value = false
}

const currentRow = ref<TradeLogData | null>(null)

const action = (row: TradeLogData) => {
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
