/* * Description: 直属会员 * Author: * Date: 2023-11-23 */
<!-- eslint-disable no-magic-numbers -->
<script setup lang="tsx">
import { ref, unref, reactive, onMounted, inject, watch } from 'vue'
import FilterTable from '../components/FilterTable.vue'
import ProTable from '../components/ProTable.vue'
import { directPlayerPageApi } from '@/api/account'
import { useAgentInfoStore } from '@/store/modules/agentInfo'
import { MemberStatusOptions, useCopyRegisterLink } from '../tools'
import type { AccountParams } from '@/api/account/types'
import { ProTableColumn } from '../types'

const props = defineProps({
  isInitTable: {
    type: Boolean,
    default: () => false
  }
})

const agentInfoStore = useAgentInfoStore()

const parentInfo: any = inject('parentInfo', {})

// 复制注册链接
const { onMemberCopyLink } = useCopyRegisterLink()

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
  status: '',
  agentId: ''
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
    if (unref(parentInfo).id) _params.agentId = unref(parentInfo).id
    const {
      data: { records, total }
    } = await directPlayerPageApi({ ..._params } as unknown as AccountParams)
    isLoading.value = false
    tableData.value = records
    tableTotal.value = total
  } catch {
    isLoading.value = false
  }
}

// 重置查询条件
const resetQueryForm = () => {
  queryForm.current = 1
  queryForm.size = 10
  queryForm.accountOrUsername = ''
  queryForm.status = ''
  queryForm.agentId = ''
}

// 重置
watch(
  () => props.isInitTable,
  () => {
    resetQueryForm()
    fetchTable()
  },
  { immediate: true, deep: true }
)

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
    flexGrow: 1,
    minWidth: 100
  },
  {
    title: '账号',
    key: 'account',
    dataKey: 'account',
    flexGrow: 1,
    minWidth: 100,
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
    flexGrow: 1,
    minWidth: 100
  },
  {
    title: '额度',
    key: 'quota',
    dataKey: 'quota',
    flexGrow: 1,
    minWidth: 100
  },
  {
    title: '上级代理',
    key: 'parentAccount',
    dataKey: 'parentAccount',
    flexGrow: 1,
    minWidth: 100
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
      <ElButton v-if="agentInfoStore.info && !parentInfo?.id" @click="onMemberCopyLink">
        注册链接
      </ElButton>
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
