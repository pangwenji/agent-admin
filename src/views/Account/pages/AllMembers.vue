/* * Description: 全部会员 * Author: * Date: 2023-11-23 */
<script setup lang="tsx">
import { ref, reactive, onMounted } from 'vue'
import FilterTable from '../components/FilterTable.vue'
import ProTable from '../components/ProTable.vue'
import { directPlayerAllPageApi } from '@/api/account'
import type { AccountParams } from '@/api/account/types'
import { MemberStatusOptions } from '../tools'
import { ProTableColumn } from '../types'

const tableRef = ref<InstanceType<typeof ProTable> | null>(null)

const createData = () => {
  tableRef.value?.callUpdatePop({
    account: '',
    username: '',
    password: '',
    parentAccount: ''
  })
}

onMounted(() => {
  fetchTable()
})

const isLoading = ref(false)
const tableTotal = ref('')
const queryForm = reactive<AccountParams>({
  current: 1,
  size: 10,
  accountOrUsername: '',
  status: ''
})

// 查询
const submitQuery = (params) => {
  queryForm.current = params?.current || queryForm.current
  queryForm.size = params?.size || queryForm.size
  fetchTable()
}

// 表格列表
const fetchTable = async () => {
  isLoading.value = true
  try {
    const params = Object.entries(queryForm).filter(([, value]) => value !== '')
    const _params = Object.fromEntries(params)
    const {
      data: { records, total }
    } = await directPlayerAllPageApi({ ..._params } as unknown as AccountParams)
    isLoading.value = false
    tableData.value = records
    tableTotal.value = total
  } catch {
    isLoading.value = false
  }
}

const tableColumns = reactive<ProTableColumn[]>([
  {
    title: '在线',
    key: 'isOnline',
    dataKey: 'isOnline',
    minWidth: 70,
    cellRenderer: (cellData: any) => (
      <>
        <span>{cellData.rowData.isOnline ? '是' : '否'}</span>
      </>
    )
  },
  {
    title: '类型',
    key: 'type',
    dataKey: 'type',
    minWidth: 100,
    flexGrow: 1
  },
  {
    title: '账号',
    key: 'account',
    dataKey: 'account',
    minWidth: 100,
    flexGrow: 1,
    cellRenderer: (cellData: any) => (
      <>
        <span style="color:#2fafec">{cellData.rowData.account}</span>
      </>
    )
  },
  {
    title: '名称',
    key: 'username',
    dataKey: 'username',
    minWidth: 100,
    flexGrow: 1
  },
  {
    title: '额度',
    key: 'quota',
    dataKey: 'quota',
    minWidth: 100,
    flexGrow: 1
  },
  {
    title: '上级代理',
    key: 'parentAccount',
    dataKey: 'parentAccount',
    minWidth: 100,
    flexGrow: 1
  },
  {
    title: '账户状态',
    key: 'status',
    dataKey: 'status',
    minWidth: 90,
    flexGrow: 1,
    cellRenderer: (cellData: any) => (
      <>
        <el-select
          v-model={cellData.rowData.status}
          onChange={() => tableRef.value?.handlerSelect(cellData.rowData, cellData.$index)}
          onClick={() => tableRef.value?.changePreStatus(cellData.rowData.status)}
          class="slot_select"
          popper-class="accountStatus_select_popup"
        >
          {MemberStatusOptions.map((item) => {
            return (
              <el-option
                key={item.value}
                label={item.label}
                value={item.value}
                disabled={item.disabled}
              >
                {item.label}
              </el-option>
            )
          })}
        </el-select>
      </>
    )
  },
  {
    title: '新增日期',
    key: 'createTime',
    dataKey: 'createTime',
    minWidth: 200,
    flexGrow: 1,
    cellRenderer: (cellData: any) => (
      <>
        <span style="text-align:center">
          {cellData.rowData.createTime ? cellData.rowData.createTime : '--'}
        </span>
      </>
    )
  },
  {
    title: '操作',
    dataKey: 'operation',
    minWidth: 200,
    flexGrow: 1,
    cellRenderer: (cellData: any) => (
      <>
        <div class="gap-2 control_row">
          <div onClick={() => tableRef.value?.callUpdatePop(cellData.rowData)}>编辑</div>
          <div onClick={() => tableRef.value?.callCheckPWDPop(cellData.rowData)}>存取额度</div>
        </div>
      </>
    )
  }
])

const tableData = ref([])
</script>
<template>
  <div>
    <FilterTable :queryForm="queryForm" :filterOptions="MemberStatusOptions" @query="submitQuery">
      <ElButton @click="createData">新增会员</ElButton>
    </FilterTable>
    <ProTable
      ref="tableRef"
      originType="player"
      :loading="isLoading"
      :queryForm="queryForm"
      :tempColumns="tableColumns"
      :tempData="tableData"
      :total="Number(tableTotal)"
      @fresh-table="submitQuery"
    />
  </div>
</template>

<style scoped lang="less">
@import url('../components/dialog.less');

:deep(.control_row) {
  .lock {
    cursor: pointer;
  }

  .unlock {
    color: #9ba09b;
    cursor: no-drop;
  }
}
</style>
