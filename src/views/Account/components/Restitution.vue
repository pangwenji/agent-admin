/* * Description: 代理返水列表 * Author: * Date: 2023-11-23 */
<script setup lang="ts">
import { ref, unref, onMounted, defineAsyncComponent, defineProps } from 'vue'
import { rebateLimitApi, getLotteryListApi } from '@/api/account'
import type { LotteryItem, UpdateLimitParams, RebateLimitItem } from '@/api/account/types'
import NavTabs from './NavTabs.vue'
import HandicapRadio from './HandicapRadio.vue'

defineProps<{
  canEditRebate: boolean
}>()

const RestitutEdit = defineAsyncComponent(() => import('./RestitutEdit.vue'))

const editRef = ref()
const curRowData = ref({} as UpdateLimitParams)
const callEditDialog = (row: any) => {
  curRowData.value = JSON.parse(JSON.stringify(row))
  curRowData.value.agentId = rowData.value?.id
  curRowData.value.lotteryCode = activeCode.value as string
  curRowData.value.handicapCode = handicapCode.value
  console.log(curRowData.value)
  editRef.value.visible = true
}

// 获取所有游戏
const getLotteryList = async () => {
  const res = await getLotteryListApi()
  if (res.success) {
    tabsList.value = res.data
    activeCode.value = res.data[0].lotteryCode
    if (res.data[0].sysHandicapList?.length) {
      handicapCode.value = res.data[0].sysHandicapList?.[0]?.handicapCode
    }
  }
  fetchTable(rowData.value?.id)
}

const tabsList = ref<LotteryItem[]>([])
const tableData = ref<RebateLimitItem[]>([])
const maxOddAmount = ref<number>()
const drawWaterRatio = ref<number>() // 抽水
const tableLoading = ref(true)

onMounted(() => {
  getLotteryList()
})

// 表格数据
const fetchTable = async (id: string) => {
  if (!showDrawer.value) return
  const _activeCode = unref(activeCode)
  if (!_activeCode) return
  tableLoading.value = true
  try {
    const res = await rebateLimitApi({
      lotteryCode: activeCode.value,
      agentId: id ? id : rowData.value?.id,
      handicapCode: handicapCode.value
    })
    tableLoading.value = false
    if (res.success) {
      const { list, maxOdd, drawWaterRatio: dwRatio } = res.data
      maxOddAmount.value = maxOdd
      drawWaterRatio.value = dwRatio
      if (list) {
        tableData.value = list
      }
    }
  } catch {
    tableLoading.value = false
  }
}

const activeCode = ref('')
const activeIndex = ref(0)
const changeType = (item, index) => {
  activeCode.value = item.lotteryCode
  activeIndex.value = index
  handicapCode.value = item?.sysHandicapList?.[0]?.handicapCode
  fetchTable(rowData.value?.id)
}
// 盘口号
const handicapCode = ref<string>('')
const onHandicapCodeChange = (val: string) => {
  handicapCode.value = val
  fetchTable(rowData.value?.id)
}

const tableTitles = [
  { prop: 'playName', name: '游戏玩法' },
  { prop: 'back', name: '返水' },
  { prop: 'orderMin', name: '单注最小' },
  { prop: 'orderMax', name: '单注最高' },
  { prop: 'issueMax', name: '单期最高' },
  { prop: 'drawWaterRatio', name: '抽水' },
  { prop: 'maxOdd', name: '最高赔付' }
]

const handleSpanMethod = ({
  rowIndex, // 当前行索引
  columnIndex // 当前列索引
}) => {
  if (columnIndex === tableTitles.length || columnIndex === tableTitles.length - 1) {
    if (rowIndex === 0) {
      // 只保留第一行
      return {
        rowspan: tableData.value.length,
        colspan: 1
      }
    } else {
      return {
        rowspan: 0,
        colspan: 0
      }
    }
  }
}

const showDrawer = ref(false)
// const direction = ref('rtl')
const handleClose = () => {
  showDrawer.value = false
}
const rowData = ref({ id: '', account: '' })
const handleOpen = (row) => {
  rowData.value = row
  showDrawer.value = true
  if (getLotteryList.length) {
    fetchTable(row.id)
  } else {
    getLotteryList()
  }
}
defineExpose({ handleOpen })
</script>
<template>
  <el-drawer v-model="showDrawer" class="refund-drawer" :before-close="handleClose">
    <div class="refund-frame">
      <div class="drawer-head">
        <img src="@/assets/svgs/arrow-left.svg" alt="" @click="handleClose" />
        {{ rowData.account }}
      </div>
      <div class="drawer-body">
        <NavTabs
          :list="tabsList"
          :activeIndex="activeIndex"
          :targetName="'lotteryName'"
          :minWidth="98"
          @change="changeType"
        />
        <HandicapRadio
          v-model="handicapCode"
          :list="tabsList[activeIndex]?.sysHandicapList || []"
          @change="onHandicapCodeChange"
        />
        <div class="shell">
          <el-table
            v-loading="tableLoading"
            :data="tableData"
            border
            style="width: 100%"
            :row-style="{ height: '42px' }"
            :header-row-style="{ height: '42px' }"
            :span-method="handleSpanMethod"
          >
            <el-table-column type="index" label="序号" align="center" width="80" />
            <el-table-column
              v-for="(title, index) in tableTitles"
              :key="title.prop"
              :prop="title.prop"
              :label="title.name"
              align="center"
              :index="index"
            >
              <template v-if="title.prop !== 'playName'" #default="scope">
                <div v-if="title.prop === 'back'" class="col-reset">
                  <span class="self">{{ scope.row.selfRebate }}</span>
                  <span class="up">{{ scope.row.upRebate }}</span>
                </div>
                <div v-if="title.prop === 'orderMin'">
                  <span>{{ scope.row.singleMinLimit }}</span>
                </div>
                <div v-if="title.prop === 'orderMax'" class="col-reset">
                  <span class="self">{{ scope.row.selfSingleMaxLimit }}</span>
                  <span class="up">{{ scope.row.upSingleMaxLimit }}</span>
                </div>
                <div v-if="title.prop === 'issueMax'" class="col-reset">
                  <span class="self">{{ scope.row.selfSingleIssueLimit }}</span>
                  <span class="up">{{ scope.row.upSingleIssueLimit }}</span>
                </div>
                <div v-if="title.prop === 'drawWaterRatio'" class="col-reset">
                  <span class="self">{{
                    typeof drawWaterRatio === 'number' ? `${drawWaterRatio}%` : drawWaterRatio
                  }}</span>
                </div>
                <div v-if="title.prop === 'maxOdd'" class="col-reset">
                  <span class="self">{{ maxOddAmount }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column v-if="canEditRebate" label="操作" align="center" width="100">
              <template #default="scope">
                <div class="edit" @click="callEditDialog(scope.row)">编辑</div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <div class="drawer-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
    <RestitutEdit ref="editRef" :curRowData="curRowData" @submit-edit="fetchTable" />
  </el-drawer>
</template>

<style scoped lang="less">
@import url('../table.less');

:deep(.el-table__cell) {
  padding: 2px 0;
  color: #5a577d;
}

.col-reset {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  span {
    line-height: 1;

    &:nth-child(2) {
      padding-top: 2px;
    }
  }

  .up {
    color: rgb(80 80 80 / 50%);
  }
}

.edit {
  color: #2fafec;
  cursor: pointer;
}

.refund-frame {
  position: relative;
}

.nav-frame {
  border-bottom: none;
}

.drawer-head {
  display: flex;
  padding: 0 20px 15px;
  margin-bottom: 15px;
  border-bottom: 1px solid #4847600d;
  box-sizing: border-box;
  align-items: center;

  img {
    margin-right: 10px;
    cursor: pointer;
    box-sizing: border-box;
  }
}

.drawer-body {
  padding: 0 20px 100px;
  box-sizing: border-box;

  .nav-frame {
    margin-bottom: 0;
  }

  .shell {
    padding: 10px;
    background: #4847600d;
  }
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  z-index: 2;
  display: flex;
  width: 100%;
  height: 70px;
  padding-right: 20px;
  overflow: hidden;
  background: #fff;
  border-top: 1px solid #4847600d;
  justify-content: flex-end;
  align-items: center;

  .el-button {
    background: none;
  }
}
</style>
<style lang="less">
.refund-drawer {
  width: 80% !important;
  max-width: 1086px;

  .el-drawer__header {
    display: none;
  }

  .el-drawer__body {
    padding-right: 0;
    padding-left: 0;
  }
}
</style>
