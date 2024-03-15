/* * Description: 直属代理 * Author: * Date: 2023-11-23 */
<!-- eslint-disable no-magic-numbers -->
<script setup lang="tsx">
import { ref, unref, reactive, onMounted, computed, inject, watch, defineAsyncComponent } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { Action } from 'element-plus'
import FilterTable from '../components/FilterTable.vue'
import ProTable from '../components/ProTable.vue'
import {
  directAgentPageApi,
  unlockAgentApi,
  commonEnableApi,
  headOfficeInfoApi
} from '@/api/account'
import { convert2Percent } from '@/utils/number'
import { useAgentInfoStore } from '@/store/modules/agentInfo'
import { useStorage } from '@/hooks/web/useStorage'
import { AgentStatusOptions, useCopyRegisterLink } from '../tools'
import type { AccountParams, DirectAgentItem } from '@/api/account/types'
import { ProTableColumn } from '../types'

const agentInfoStore = useAgentInfoStore()
const Restitution = defineAsyncComponent(() => import('../components/Restitution.vue'))
const DayLog = defineAsyncComponent(() => import('../components/DayLog.vue'))
const ControlButtons = defineAsyncComponent(() => import('../components/ControlButtons.vue'))

const props = defineProps({
  isInitTable: {
    type: Boolean,
    default: () => false
  }
})

const parentInfo: any = inject('parentInfo', {})

const { getStorage } = useStorage()
const adminID = getStorage('userId')
const canEditRebate = ref(false)
const initSystemConfig = async () => {
  if (adminID) {
    try {
      const res = await headOfficeInfoApi()
      // 根据系统配置显示赔率，返水，走飞开关
      const { isOddOpen, isRebateOpen, isFlyOpen } = res.data
      const switchArr = tableColumns.filter(
        (item) =>
          item.dataKey === 'isOddOpen' ||
          item.dataKey === 'isRebateOpen' ||
          item.dataKey === 'isFlyOpen'
      )
      switchArr[0].hidden = !Boolean(isOddOpen) //赔率
      switchArr[1].hidden = !Boolean(isRebateOpen) //返水
      switchArr[2].hidden = !Boolean(isFlyOpen) //走飞
      const agentInfo = await agentInfoStore.getAgentInfo()
      canEditRebate.value = Boolean(agentInfo?.isRebateOpen) && Boolean(isRebateOpen)
    } catch {}
  }
}
onMounted(() => {
  initSystemConfig()
})

const isShowBtn = computed(() => {
  if (!agentInfoStore.info) return false
  // 三级代理不能新增代理和邀请注册,可以新增会员
  // agetntType 0-总公司，1-分公司，2-代理 ，agentLevel 1-一级代理，2-二级代理，3-三级代理
  const agentLevel = agentInfoStore.info?.agentLevel
  if (Number(agentLevel) <= 2) return true
  return false
})

const refundRef = ref()
const dayLogRef = ref()

// 复制注册链接
const { onAgentCopyLink } = useCopyRegisterLink()

const tableRef = ref<InstanceType<typeof ProTable> | null>(null)

// 开关相关
const inactive_color = 'rgba(72, 71, 96, 0.1)'
const active_color = '#2FAFEC'

enum StatusType {
  isOddOpen = 1,
  isRebateOpen = 2,
  isFlyOpen = 3
}

enum StatusName {
  isOddOpen = '赔率',
  isRebateOpen = '返水',
  isFlyOpen = '走飞'
}

const handlerSwitch = (type: string, index: number): Promise<boolean> => {
  const list = unref(tableData)

  console.log('StatusName => ', StatusName)
  console.log('StatusName => ', StatusName[type], list, index)

  const _text = list[index][type] ? '关闭' : '开启'
  const _switchStatus = list[index][type] ? 0 : 1
  let desc = `确定要 <span style="color:#2fafec">${_text}</span> ${StatusName[type]} 吗?`
  if (!_switchStatus) {
    desc = `确定要 <span style="color:#ee5b75">${_text}</span> ${StatusName[type]} 吗?`
  }

  return new Promise((resolve) => {
    ElMessageBox.alert(desc, '操作确认', {
      confirmButtonText: '确定',
      distinguishCancelAndClose: true,
      dangerouslyUseHTMLString: true,
      customClass: 'switch_messageBox',
      callback: async (action: Action) => {
        if (action === 'confirm') {
          const { success } = await commonEnableApi({
            id: String(list[index]['id']),
            switchEnum: _switchStatus,
            statusType: StatusType[type] // 1赔率 2返水 3走飞
          })
          if (success) {
            ElMessage({
              type: 'success',
              message: `${_text} 成功`
            })
            fetchTable()
            return resolve(true)
          } else {
            ElMessage({
              type: 'error',
              message: `${_text} 失败`
            })
            return resolve(false)
          }
        } else {
        }
      }
    })
  })
}

const createData = () => {
  tableRef.value?.callUpdatePop({
    account: '',
    username: '',
    password: '',
    percentage: '',
    sportsPercentage: '',
    videoPercentage: '',
    parentAccount: parentInfo?.value?.account || '',
    parentAgentId: queryForm.agentId || '',
    isBelow: Boolean(queryForm.agentId) // 是否帮下级直属代理新增代理
  })
}

const editData = (row: any) => {
  tableRef.value?.callUpdatePop({
    ...row,
    isBelow: Boolean(queryForm.agentId)
  })
}

//解锁代理
const submitUnLock = (row) => {
  // eslint-disable-next-line no-magic-numbers
  if (row.status === 2) {
    let desc = `确定 解锁 账号 <span style="color:#2fafec"> ${row.account}</span> 吗?`
    ElMessageBox.alert(desc, '操作确认', {
      confirmButtonText: '确定',
      distinguishCancelAndClose: true,
      dangerouslyUseHTMLString: true,
      customClass: 'switch_messageBox',
      callback: async (action: Action) => {
        if (action === 'confirm') {
          await unlockAgentApi({ id: row.id })
          ElMessage({
            type: 'success',
            message: `账号 ${row.account} 解锁成功`
          })
          fetchTable()
        }
      }
    })
  }
}

const isLoading = ref(false)
const tableTotal = ref<number>(0)
const queryForm = reactive<AccountParams>({
  current: 1,
  size: 10,
  accountOrUsername: '',
  status: '',
  agentId: ''
})

// 重置查询条件
const resetQueryForm = () => {
  queryForm.current = 1
  queryForm.size = 10
  queryForm.accountOrUsername = ''
  queryForm.status = ''
  queryForm.agentId = ''
}

// 查询
const submitQuery = (params) => {
  queryForm.current = params?.current || queryForm.current
  queryForm.size = params?.size || queryForm.size
  fetchTable()
}

// 当前登录用户的表格列表
const fetchTable = async () => {
  isLoading.value = true
  try {
    const params = Object.entries(queryForm).filter(([, value]) => value !== '')
    const _params = Object.fromEntries(params)
    const {
      data: { records, total }
    } = await directAgentPageApi({ ..._params } as unknown as AccountParams)
    isLoading.value = false
    tableData.value = records
    tableTotal.value = total
  } catch {
    isLoading.value = false
  }
}

// 查询下级直属代理
const checkBelowDirect = (row: any) => {
  if (!row?.id) return
  if (!+row?.childAgentCount) {
    ElMessage({
      type: 'warning',
      message: `账号 ${row.account} 暂无下级代理`
    })
    return
  }
  emits('updateParent', { tabName: null, row })
  resetQueryForm()
  const { id } = row
  queryForm.agentId = id
  fetchTable()
}

// 查看直属会员
const checkBelowPlayer = (row) => {
  if (!row?.id) return
  if (!+row?.childPlayerCount) {
    ElMessage({
      type: 'warning',
      message: `账号 ${row.account} 暂无直属会员`
    })
    return
  }
  // parentInfo.value = row
  resetQueryForm()
  const { id } = row
  queryForm.agentId = id
  emits('updateParent', { tabName: 'DirectMembers', row })
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

const emits = defineEmits(['updateParent'])

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
    key: 'agentType',
    dataKey: 'agentType',
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
        <span
          onClick={() => checkBelowDirect(cellData.rowData)}
          style="color:#2fafec; cursor: pointer"
        >
          {cellData.rowData.account}
        </span>
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
    title: '下级代理',
    key: 'childAgentCount',
    dataKey: 'childAgentCount',

    minWidth: 100,
    flexGrow: 1,
    cellRenderer: (cellData: any) => (
      <>
        <span
          onClick={() => checkBelowDirect(cellData.rowData)}
          style="color:#2fafec; cursor: pointer"
        >
          {cellData.rowData.childAgentCount}
        </span>
      </>
    )
  },
  {
    title: '直属会员',
    key: 'childPlayerCount',
    dataKey: 'childPlayerCount',
    minWidth: 100,
    flexGrow: 1,
    cellRenderer: (cellData: any) => (
      <>
        <span
          onClick={() => checkBelowPlayer(cellData.rowData)}
          style="color:#2fafec; cursor: pointer"
        >
          {cellData.rowData.childPlayerCount}
        </span>
      </>
    )
  },
  {
    title: '彩票占成',
    key: 'percentage',
    dataKey: 'percentage',
    minWidth: 90,
    flexGrow: 1,
    cellRenderer: (cellData: any) => (
      <span>
        {cellData.rowData.percentage ? convert2Percent(cellData.rowData.percentage) : '--'}
      </span>
    )
  },
  {
    title: '体育占成',
    key: 'sportsPercentage',
    dataKey: 'sportsPercentage',
    minWidth: 90,
    flexGrow: 1,
    cellRenderer: (cellData: any) => (
      <span>
        {cellData.rowData.sportsPercentage
          ? convert2Percent(cellData.rowData.sportsPercentage)
          : '--'}
      </span>
    )
  },
  {
    title: '视讯占成',
    key: 'videoPercentage',
    dataKey: 'videoPercentage',
    minWidth: 90,
    flexGrow: 1,
    cellRenderer: (cellData: any) => (
      <span>
        {cellData.rowData.videoPercentage
          ? convert2Percent(cellData.rowData.videoPercentage)
          : '--'}
      </span>
    )
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
        >
          {AgentStatusOptions.map((item) => {
            return (
              <el-option key={item.value} label={item.label} value={item.value}>
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
          <div onClick={() => editData(cellData.rowData)}>编辑</div>
          <div onClick={() => refundRef.value?.handleOpen(cellData.rowData)}>返水</div>
          <div onClick={() => tableRef.value?.callCheckPWDPop(cellData.rowData)}>存取额度</div>
          <ControlButtons
            row={cellData.rowData}
            clickLog={() => dayLogRef.value?.handleOpen(cellData.rowData)}
            clickUnlock={() => submitUnLock(cellData.rowData)}
            clickResetPWD={() => tableRef.value?.callResetPWDPop(cellData.rowData)}
          />
        </div>
      </>
    )
  },
  {
    title: '赔率',
    key: 'isOddOpen',
    dataKey: 'isOddOpen',
    minWidth: 90,
    hidden: true,
    cellRenderer: (cellData: any) => (
      <>
        <el-switch
          model-value={Boolean(cellData.rowData.isOddOpen)}
          active-color={active_color}
          inactive-color={inactive_color}
          onChange={() => handlerSwitch('isOddOpen', cellData.$index)}
          inline-prompt
          active-text="开"
          inactive-text="关"
          size="large"
        ></el-switch>
      </>
    )
  },
  {
    title: '返水',
    key: 'isRebateOpen',
    dataKey: 'isRebateOpen',

    minWidth: 90,
    hidden: true,
    cellRenderer: (cellData: any) => (
      <>
        <el-switch
          model-value={Boolean(cellData.rowData.isRebateOpen)}
          active-color={active_color}
          inactive-color={inactive_color}
          onChange={() => handlerSwitch('isRebateOpen', cellData.$index)}
          inline-prompt
          active-text="开"
          inactive-text="关"
          size="large"
        ></el-switch>
      </>
    )
  },
  {
    title: '走飞',
    key: 'isFlyOpen',
    dataKey: 'isFlyOpen',

    minWidth: 90,
    hidden: true,
    cellRenderer: (cellData: any) => (
      <>
        <el-switch
          model-value={Boolean(cellData.rowData.isFlyOpen)}
          active-color={active_color}
          inactive-color={inactive_color}
          onChange={() => handlerSwitch('isFlyOpen', cellData.$index)}
          inline-prompt
          active-text="开"
          inactive-text="关"
          size="large"
        ></el-switch>
      </>
    )
  }
])

const tableData = ref<DirectAgentItem[]>([])
</script>
<template>
  <div>
    <FilterTable :queryForm="queryForm" :filterOptions="AgentStatusOptions" @query="submitQuery">
      <el-button v-if="isShowBtn" @click="createData">新增代理</el-button>
      <el-button v-if="isShowBtn && !queryForm.agentId" @click="onAgentCopyLink">
        注册链接
      </el-button>
    </FilterTable>
    <ProTable
      ref="tableRef"
      originType="agent"
      :loading="isLoading"
      :queryForm="queryForm"
      :tempColumns="tableColumns"
      :tempData="tableData"
      :total="Number(tableTotal)"
      @fresh-table="submitQuery"
    />
    <!-- 返水 -->
    <Restitution ref="refundRef" :canEditRebate="canEditRebate" />
    <!-- 日志 -->
    <DayLog ref="dayLogRef" />
  </div>
</template>

<style scoped lang="less">
@import url('../components/dialog.less');

.open {
  color: #2fafec;
}

.close {
  color: #ee5b75;
}

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
