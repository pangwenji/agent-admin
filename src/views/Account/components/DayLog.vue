/* * Description: 日志 * Author: * Date: 2023-11-27 */
<script setup lang="ts">
import { ref, unref, reactive, computed } from 'vue'
import { logLoginApi, logOperateApi, logTradeApi } from '@/api/account'
import type { DayLogParams } from '@/api/account/types'
import NavTabs from './NavTabs.vue'

const tabsList = ref([
  { name: '登录日志', key: 'login', api: logLoginApi },
  { name: '操作日志', key: 'operate', api: logOperateApi },
  { name: '账变日志', key: 'trade', api: logTradeApi }
])

const queryForm = reactive<DayLogParams>({
  current: 1,
  size: 10,
  agentId: ''
})

const tableData = ref([])
const tableTotal = ref(0)
const tableLoading = ref(true)

// 表格数据
const fetchTable = async () => {
  if (!showDrawer.value) return
  if (!rowData.value.id) return
  tableLoading.value = true
  try {
    const {
      data: { records, total }
    } = await activeTab.value.api({ ...queryForm })
    tableLoading.value = false
    tableData.value = records
    tableTotal.value = Number(total)
  } catch {
    tableLoading.value = false
  }
}

const activeTab: any = ref({})
const activeIndex = ref(0)

const changeType = (item, index) => {
  activeTab.value = item
  activeIndex.value = index
  queryForm.current = 1
  queryForm.size = 10
  tableData.value = []
  fetchTable()
}

const titles = {
  // 登录日志表头
  login: [
    { prop: 'id', name: 'ID' },
    { prop: 'account', name: '账号' },
    { prop: 'domainName', name: '域名' },
    { prop: 'remark', name: '状态' },
    { prop: 'ipAddr', name: 'IP' },
    { prop: 'createTime', name: '时间' }
  ],
  // 操作日志表头
  operate: [
    { prop: 'id', name: '编号' },
    { prop: 'operate', name: '类型' },
    { prop: 'userName', name: '操作账号' },
    { prop: 'updateTime', name: '变更日期' },
    { prop: 'ipAddress', name: 'IP' }
  ],
  // 账变日志表头
  trade: [
    { prop: 'id', name: '编号' },
    { prop: 'agentAccount', name: '账号' },
    { prop: 'beforeBalance', name: '账变前值' },
    { prop: 'tradeAmount', name: '变化值' },
    { prop: 'afterBalance', name: '账变后值' },
    { prop: 'updateTime', name: '账变日期' }
  ]
}

const tableTitles = computed(() => titles[activeTab.value.key])

const showDrawer = ref(false)
// const direction = ref('rtl')
const handleClose = () => {
  showDrawer.value = false
}

const handleSizeChange = (val: number) => {
  // queryForm.current = 1
  queryForm.size = val
  fetchTable()
}
const handleCurrentChange = (val: number) => {
  // queryForm.size = 10
  queryForm.current = val
  fetchTable()
}

const rowData = ref({ id: '', account: '' })
const handleOpen = (row) => {
  activeTab.value = unref(tabsList)[0]
  activeIndex.value = 0
  rowData.value = row
  queryForm.agentId = row.id
  showDrawer.value = true
  fetchTable()
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
          :targetName="'name'"
          :minWidth="98"
          @change="changeType"
        />
        <div class="shell">
          <el-table
            v-loading="tableLoading"
            :data="tableData"
            border
            style="width: 100%"
            :row-style="{ height: '42px' }"
            :header-row-style="{ height: '42px' }"
          >
            <el-table-column
              v-for="(title, index) in tableTitles"
              :key="title.prop"
              :prop="title.prop"
              :label="title.name"
              align="center"
              :index="index"
            />
          </el-table>
        </div>
      </div>
    </div>
    <div v-if="tableTotal" class="drawer-footer">
      <el-pagination
        v-model:current-page="queryForm.current"
        :page-size="queryForm.size"
        :small="false"
        background
        layout="prev, pager, next, sizes, jumper"
        :total="tableTotal"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-drawer>
</template>

<style scoped lang="less">
@import url('../table.less');

:deep(.el-table__cell) {
  padding: 2px 0;
  color: #5a577d;
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
