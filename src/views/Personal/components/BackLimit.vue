/* * Description: 返水额度 * Author: * Date: 2023-11-23 */
<script setup lang="ts">
import { ref, unref, onMounted, defineAsyncComponent } from 'vue'
import { rebateLimitApi, getLotteryListApi, headOfficeInfoApi } from '@/api/account'
import NavTabs from '@/views/Account/components/NavTabs.vue'
import HandicapRadio from '@/views/Account/components/HandicapRadio.vue'
import { LotteryItem, RebateLimitItem, UpdateLimitParams } from '@/api/account/types'
import { personInfoApi } from '@/api/personal'

const RestitutEdit = defineAsyncComponent(
  () => import('@/views/Account/components/RestitutEdit.vue')
)

const editRef = ref()
const curRowData = ref({} as UpdateLimitParams)
const callEditDialog = (row: RebateLimitItem) => {
  curRowData.value.lotteryCode = activeCode.value as string
  curRowData.value.handicapCode = handicapCode.value
  curRowData.value = {
    lotteryCode: activeCode.value,
    handicapCode: handicapCode.value,
    playCode: row.playCode,
    selfRebate: row.selfRebate,
    selfSingleMaxLimit: row.selfSingleMaxLimit,
    selfSingleIssueLimit: row.selfSingleIssueLimit
  }
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
  fetchTable()
}

// 检查当前账号是否有编辑返水的权限
const canEditRebate = ref(false)
const checkEditRebateAuth = async () => {
  try {
    const [resHeadOffice, resPerson] = await Promise.all([headOfficeInfoApi(), personInfoApi()])
    canEditRebate.value =
      Boolean(resHeadOffice.data.isRebateOpen) && Boolean(resPerson.data.isRebateOpen)
  } catch {}
}

const tabsList = ref<LotteryItem[]>([])
const tableData = ref<RebateLimitItem[]>([])
const maxOddAmount = ref<number>()
const drawWaterRatio = ref<number>() // 抽水
const tableLoading = ref(true)

onMounted(() => {
  checkEditRebateAuth()
  getLotteryList()
})

// 表格数据
const fetchTable = async () => {
  const _activeCode = unref(activeCode)
  if (!_activeCode) return
  tableLoading.value = true
  try {
    const res = await rebateLimitApi({
      lotteryCode: activeCode.value,
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
  handicapCode.value = item.sysHandicapList?.[0]?.handicapCode
  fetchTable()
}

// 盘口号
const handicapCode = ref('')
const onHandicapCodeChange = (val: string) => {
  handicapCode.value = val
  fetchTable()
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
</script>
<template>
  <div>
    <NavTabs
      :list="tabsList"
      :activeIndex="activeIndex"
      :targetName="'lotteryName'"
      :minWidth="0"
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
          :min-width="150"
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
        <el-table-column
          v-if="canEditRebate"
          type="edit-button"
          label="操作"
          align="center"
          width="90"
        >
          <template #default="scope">
            <ElButton
              type="primary"
              class="w-full"
              link
              @click="
                () => {
                  callEditDialog(scope.row)
                }
              "
            >
              编辑
            </ElButton>
          </template>
        </el-table-column>
      </el-table>
      <RestitutEdit ref="editRef" :curRowData="curRowData" @submit-edit="fetchTable" />
    </div>
  </div>
</template>

<style scoped lang="less">
@import url('../table.less');

@normalColor: #48476047;
@activeColor: #2fafec;

.shell {
  padding: 10px;
  background: #4847600d;
  box-sizing: border-box;
}

:deep(.nav-frame) {
  margin-bottom: 0;
}

:deep(.el-table__cell) {
  padding: 2px 0;
  color: #5a577d;
}

:deep(.el-button) {
  border: none;
  outline: none;
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
</style>
