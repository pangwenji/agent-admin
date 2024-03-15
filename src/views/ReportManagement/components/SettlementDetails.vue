<script lang="tsx" setup>
import { ref, computed, watch, nextTick } from 'vue'
import {
  ElDrawer,
  FormInstance,
  FormRules,
  ElFormItem,
  ElForm,
  ElInput,
  ElTable,
  ElTableColumn
} from 'element-plus'
import { reactive } from 'vue'
import {
  ReportDetailItem,
  SettlementDetail,
  SettlementDetailConfigItem
} from '@/api/reportManagement/types'
import { getSettlementDetail } from '@/api/reportManagement'

const openDrawer = ref(false)

const handleOpen = (currentRow?: ReportDetailItem) => {
  openDrawer.value = true
  if (currentRow?.orderDetailNo) {
    formModel.orderNo = currentRow.orderDetailNo
    nextTick(() => {
      onSubmit(formRef.value)
    })
  }
}
const handleClose = () => {
  openDrawer.value = false
}

// 结算明细数据
const settlementData = ref<SettlementDetail | null>(null)

// 四个表格数据
const briefData = computed(() => {
  return settlementData.value ? [settlementData.value] : []
})
const orderInfoData = computed(() => {
  return settlementData.value ? [settlementData.value?.orderInfo] : []
})
const configsData = computed(() => {
  return settlementData.value ? settlementData.value.settlementConfigs : []
})
const transactionData = computed(() => {
  return settlementData.value ? settlementData.value.transactionRecords : []
})
const loading = ref(false)
const formRef = ref<FormInstance>()
const formModel = reactive({
  orderNo: ''
})
const rules = reactive<FormRules>({
  orderNo: [{ required: true, type: 'string', trigger: 'blur', message: '请输入正确的注单编号' }]
})
const onSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      loading.value = true
      try {
        const res = await getSettlementDetail(formModel)
        settlementData.value = res.data
      } catch {
        settlementData.value = null
      } finally {
        loading.value = false
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 重置状态
watch(openDrawer, (openStatus) => {
  if (openStatus === false) {
    formModel.orderNo = ''
    settlementData.value = null
  }
})

// 配置结算分栏 cell
const ConfigCell = ({ row, rowKey }: { row: SettlementDetailConfigItem; rowKey: string }) => {
  const contents = row[rowKey]?.split?.('/') as string[]
  return (
    <>
      <div class="flex-1 h-full flex justify-center items-center">{contents?.[0]}</div>
      {contents?.[1] && (
        <div class="w-2/3 h-full flex justify-center items-center">{contents?.[1]}</div>
      )}
    </>
  )
}

defineExpose({
  open: handleOpen,
  close: handleClose
})
</script>

<template>
  <ElDrawer
    v-model="openDrawer"
    v-loading="loading"
    class="settlement-drawer"
    size="75%"
    destroy-on-close
    :show-close="false"
  >
    <template #header>
      <div class="drawer-header">
        <div class="back" @click="handleClose">
          <Icon icon="ep:arrow-left-bold" />
        </div>
        <div> 结算明细 </div>
      </div>
    </template>
    <div class="mb-3">
      <ElForm
        ref="formRef"
        :inline="true"
        :model="formModel"
        :rules="rules"
        :hide-required-asterisk="true"
      >
        <ElFormItem label="注单编号" prop="orderNo">
          <ElInput v-model.trim="formModel.orderNo" />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" :loading="loading" @click="onSubmit(formRef)">查询</ElButton>
        </ElFormItem>
      </ElForm>
    </div>
    <div class="table-group-wrapper">
      <div class="table-wrapper mb-3">
        <ElTable
          v-loading="loading"
          headerAlign="center"
          :data="briefData"
          style="width: 100%"
          border
        >
          <ElTableColumn align="center" :min-width="120" property="orderNo" label="注单编号" />
          <ElTableColumn align="center" :min-width="120" property="winOrLoss" label="会员输赢" />
          <ElTableColumn align="center" :min-width="120" property="allExpense" label="平台结算">
            <template #default="scope">
              {{ scope.row.allExpense > 0 ? `+${scope.row.allExpense}` : scope.row.allExpense }}
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
      <div class="table-wrapper mb-3 detail-info-group">
        <p class="mt-0 table-title">注单信息</p>
        <ElTable v-loading="loading" :data="orderInfoData" style="width: 100%" border>
          <ElTableColumn
            align="center"
            :min-width="120"
            property="userAccount"
            label="会员账号"
            fixed="left"
          />
          <ElTableColumn align="center" :min-width="120" property="lotteryName" label="游戏名称" />
          <ElTableColumn
            align="center"
            :min-width="120"
            property="periodsNumber"
            label="游戏期数"
          />
          <ElTableColumn align="center" :min-width="160" property="orderDate" label="投注时间" />
          <ElTableColumn align="center" :min-width="120" property="totalAmount" label="投注金额" />
          <ElTableColumn align="center" :min-width="120" property="validAmount" label="有效投注" />
          <ElTableColumn align="center" :min-width="120" property="playTypeName" label="玩法类型" />
        </ElTable>
        <ElTable v-loading="loading" :data="orderInfoData" style="width: 100%" border>
          <ElTableColumn align="center" :min-width="120" property="playName" label="投注内容" />
          <ElTableColumn align="center" :min-width="120" property="odds" label="赔率" />
          <ElTableColumn align="center" :min-width="120" property="returnPointRatio" label="返水" />
          <ElTableColumn
            align="center"
            :min-width="160"
            property="settlementDate"
            label="结算时间"
          />
          <ElTableColumn align="center" :min-width="120" property="winOrLoss" label="会员输赢" />
          <ElTableColumn align="center" :min-width="120" property="rewardAmount" label="派彩金额" />
          <ElTableColumn align="center" :min-width="120" property="returnAmount" label="返水金额" />
        </ElTable>
      </div>
      <div class="other-info-group flex justify-between w-full">
        <div class="table-wrapper">
          <p class="mt-0 table-title">配置结算</p>
          <ElTable v-loading="loading" :data="configsData" border>
            <ElTableColumn
              align="center"
              :min-width="90"
              property="agentType"
              label="层级"
              fixed="left"
            />
            <ElTableColumn
              align="center"
              :min-width="170"
              property="rebateAndGetRebate"
              label="返水/赚水"
              className="config-split-col"
            >
              <template #default="scope">
                <ConfigCell rowKey="rebateAndGetRebate" :row="scope.row" />
              </template>
            </ElTableColumn>
            <ElTableColumn
              align="center"
              :min-width="170"
              property="oddAndGetOdd"
              label="赔率/赚赔"
              className="config-split-col"
            >
              <template #default="scope">
                <ConfigCell rowKey="oddAndGetOdd" :row="scope.row" />
              </template>
            </ElTableColumn>
            <ElTableColumn
              align="center"
              :min-width="170"
              property="percentageAndResult"
              label="占成/结果"
              className="config-split-col"
            >
              <template #default="scope">
                <ConfigCell rowKey="percentageAndResult" :row="scope.row" />
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
        <div class="table-wrapper ml-3">
          <p class="mt-0 table-title">账变记录</p>
          <ElTable v-loading="loading" :data="transactionData" border>
            <ElTableColumn
              align="center"
              :min-width="90"
              property="agentType"
              label="层级"
              fixed="left"
            />
            <ElTableColumn
              align="center"
              :min-width="120"
              property="beforeTransfer"
              label="账变前"
            />
            <ElTableColumn
              align="center"
              :min-width="120"
              property="transactionAmount"
              label="账变金额/其他"
            />
            <ElTableColumn
              align="center"
              :min-width="120"
              property="afterTransfer"
              label="账变后"
            />
          </ElTable>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="drawer-footer">
        <ElButton @click="handleClose">关闭</ElButton>
      </div>
    </template>
  </ElDrawer>
</template>

<style lang="less">
.settlement-drawer {
  --el-border-color-lighter: rgba(72, 71, 96, 0.1);
  --padding-inline: 24px;
  .el-drawer__header {
    margin-bottom: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    padding-top: 0;
    .drawer-header {
      padding-top: 20px;
      padding-bottom: 18px;
    }
  }
  .el-drawer__body {
    padding-inline: 0;
    padding-top: 0;
  }
  .el-drawer__footer {
    border-top: 1px solid var(--el-border-color-lighter);
    .el-button {
      padding-block: 17px;
      padding-inline: 30px;
    }
  }
}
</style>
<style lang="less" scoped>
@import url('@/styles/mixins.less');

:deep(.el-form) {
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-block: 12px;
  padding-inline: var(--padding-inline);
  .el-form-item:not(:last-child) {
    border: 1px solid var(--el-input-border-color, var(--el-border-color));
    border-radius: 6px;
    margin-right: 16px;
  }
  .el-form-item {
    margin-bottom: 0;
  }
  .el-form-item__label {
    padding-inline: 16px;
    border-right: inherit;
  }
  .el-input__wrapper {
    box-shadow: none;
    &.is-focus,
    &:hover {
      box-shadow: none !important;
    }
  }
  .el-input__inner {
    width: 22.5em;
  }
}

.drawer-header {
  color: var(--dark-text-color);
  display: flex;
  align-items: center;
  .back {
    height: 35px;
    width: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.table-group-wrapper {
  padding-inline: var(--padding-inline);
}
.table-wrapper {
  width: 100%;
  background: #4847600d;
  padding: 10px 10px;
  box-sizing: border-box;
}
.table-title {
  padding-top: calc(1em - 10px);
}
:deep(.el-table) {
  .custom-table();
  border-radius: 10px;
}
.detail-info-group {
  :deep(.el-table) {
    &:first-of-type {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    &:last-of-type {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }
}
.other-info-group {
  .table-wrapper {
    width: 49.8%;
  }
}

:deep(.el-table__body-wrapper) {
  .config-split-col {
    padding-block: 0;
    .cell {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0;
      height: 100%;
      & > div:nth-last-child(2) {
        background-color: var(--top-header-hover-color);
        border-right: var(--el-table-border);
      }
    }
  }
}
</style>
