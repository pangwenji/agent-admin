/* * Description: 表格组件 * Author: * Date: 2023-11-23 */
<!-- eslint-disable no-magic-numbers -->
<script lang="tsx" setup>
import { numberMultiplied100 } from '@/utils/number'
import {
  ref,
  reactive,
  computed,
  defineEmits,
  inject,
  onMounted,
  defineAsyncComponent,
  PropType
} from 'vue'
import { useRouter } from 'vue-router'
import { ProTableColumn } from '../types'

const UpdateDialog = defineAsyncComponent(() => import('../components/UpdateDialog.vue'))
const LimitDialog = defineAsyncComponent(() => import('../components/LimitDialog.vue'))
const InquiryDialog = defineAsyncComponent(() => import('../components/InquiryDialog.vue'))
const ResetPWDDialog = defineAsyncComponent(() => import('./ResetPWDDialog.vue'))

const props = defineProps({
  originType: {
    type: String,
    default: () => 'agent' // agent代理 / player会员
  },
  tempColumns: {
    type: Array as PropType<ProTableColumn[]>,
    default: () => {
      return {}
    }
  },
  tempData: {
    type: Array as PropType<any[]>,
    default: () => {
      return {}
    }
  },
  total: {
    type: Number,
    default: () => {
      return 0
    }
  },
  queryForm: {
    type: Object,
    default: () => {
      return {}
    }
  },
  loading: {
    type: Boolean,
    default: () => false
  }
})
const tableColumns = computed(() => props.tempColumns)
const tableData = computed(() => props.tempData)
const tableTotal = computed(() => props.total)
const queryData = computed(() => props.queryForm)
const tableLoading = computed(() => props.loading)

const navTitle = inject('navTitle')

const isFixed = ref(false)
onMounted(() => {
  const clientW = window.innerWidth || document.documentElement.clientWidth
  isFixed.value = clientW < (props.originType === 'agent' ? 1700 : 1280)
})

const router = useRouter()
const routerTo = (path: string, query?: any) => {
  router.push({ path, query })
}

const updateRef = ref()
const limitRef = ref()
const inquiryRef = ref()

const curRowData = ref()

// 存取额度对话框
const callLimitPop = (row) => {
  curRowData.value = row
  limitRef.value.handleOpen()
}
// 存取额度提交成功反馈
const submitLimit = () => {
  updateTable()
}

// 代理/会员 操作存取额度前的操作密码验证
const isCheckPWD = ref(false)
const callCheckPWDPop = (row) => {
  isCheckPWD.value = true
  curRowData.value = row
  showResetPWD.value = true
}
const handleCheckPWDSuccess = () => {
  callLimitPop(curRowData.value)
}

const closeLimit = () => {
  isCheckPWD.value = false
  console.log('关闭存取额度对话框')
}

// 重置操作密码对话框
const showResetPWD = ref(false)
const callResetPWDPop = (row) => {
  isCheckPWD.value = false
  curRowData.value = row
  showResetPWD.value = true
}

const closeInquiry = () => {
  console.log('关闭账户状态对话框')
}

//账户状态选择
const changePreStatus = (status) => {
  statusData.perStatus = status
}
const handlerSelect = (row, index) => {
  statusData.id = row.id
  statusData.account = row.account
  statusData.nextStatus = row.status
  statusData.index = index
  tableData.value[index].status = statusData.perStatus
  inquiryRef.value.inquiryVisible = true
}
// 账户状态提交成功反馈
const submitInquiry = () => {
  updateTable()
}

const handleSizeChange = (val: number) => {
  updateTable(1, val)
}
const handleCurrentChange = (val: number) => {
  updateTable(val)
}

const statusData = reactive({
  id: null,
  perStatus: null,
  nextStatus: null,
  index: '',
  account: ''
})
// 新增/编辑提交成功反馈
const submitUpdate = () => {
  updateTable()
}

const closeUpdate = () => {}

// 新增/编辑弹框
const callUpdatePop = (row: any) => {
  curRowData.value = JSON.parse(JSON.stringify(row))
  if (curRowData?.value?.percentage) {
    curRowData.value.percentage = numberMultiplied100(curRowData.value?.percentage)
  }
  if (curRowData?.value?.sportsPercentage) {
    curRowData.value.sportsPercentage = numberMultiplied100(curRowData.value?.sportsPercentage)
  }
  if (curRowData?.value?.videoPercentage) {
    curRowData.value.videoPercentage = numberMultiplied100(curRowData.value?.videoPercentage)
  }
  updateRef.value.handleOpen()
}

// 更新表格数据
const updateTable = (
  current: number = props.queryForm.current,
  size: number = props.queryForm.size
) => {
  emits('freshTable', { current, size })
}

const emits = defineEmits(['freshTable'])
defineExpose({
  callLimitPop,
  callCheckPWDPop,
  submitInquiry,
  closeLimit,
  closeInquiry,
  handlerSelect,
  changePreStatus,
  routerTo,
  callUpdatePop,
  callResetPWDPop
})
</script>
<template>
  <div class="table-frame">
    <div class="stat-amount"> {{ navTitle }}数量: {{ tableTotal }} </div>
    <ElTable v-loading="tableLoading" :data="tableData" style="width: 100%" border>
      <ElTableColumn
        v-for="col in tableColumns"
        :key="col.dataKey"
        :prop="col.dataKey"
        :label="col.title"
        :width="col.width"
        :min-width="col.minWidth"
        align="center"
      >
        <template v-if="col.cellRenderer" #default="scope">
          <component
            :is="
              col.cellRenderer({
                rowData: scope.row,
                ...scope
              })
            "
          />
        </template>
      </ElTableColumn>
    </ElTable>
  </div>
  <ElPagination
    v-model:current-page="queryData.current"
    :page-size="queryData.size"
    :small="false"
    background
    layout="prev, pager, next, sizes, jumper"
    :total="tableTotal"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />

  <!-- 新增/编辑 -->
  <UpdateDialog
    ref="updateRef"
    :originType="originType"
    :curRowData="curRowData"
    @submit-update="submitUpdate"
    @close="closeUpdate"
  />
  <!-- 账户状态操作确认 -->
  <InquiryDialog
    ref="inquiryRef"
    :originType="originType"
    :statusData="statusData"
    @submit-inquiry="submitInquiry"
    @close="closeInquiry"
  />
  <!-- 存取额度 -->
  <LimitDialog
    ref="limitRef"
    :originType="originType"
    :curRowData="curRowData"
    @submit="submitLimit"
    @close="closeLimit"
  />
  <!-- 操作密码 -->
  <ResetPWDDialog
    v-if="curRowData?.id"
    :id="curRowData?.id"
    v-model="showResetPWD"
    :isCheck="isCheckPWD"
    @check-pwd-success="handleCheckPWDSuccess"
  />
</template>

<style lang="less">
// 会员状态的 select 下拉框去除锁定
.accountStatus_select_popup {
  .el-select-dropdown__list {
    .is-disabled {
      display: none;
    }
  }
}
</style>
<style lang="less" scoped>
@import url('./proTable.less');
:deep(.head-width) {
  .el-table-v2__header {
    width: inherit !important;
  }
}
.stat-amount {
  margin: 0 0 15px;
  font-family: 'Microsoft YaHei UI';
  font-size: var(--el-font-size-base);
  font-weight: 400;
  line-height: 18px;
  color: #424251;
  box-sizing: border-box;
}
</style>
