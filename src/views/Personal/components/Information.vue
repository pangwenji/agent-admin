/* * Description: 个人资料 * Author: * Date: 2023-11-23 */
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { personInfoApi } from '@/api/personal'
import { HierarchyInfo } from '@/api/personal/types'

const fetchInfo = async () => {
  try {
    const res = await personInfoApi()
    if (res.success) {
      const { personQuota, hierarchyInfos } = res.data
      personLimit.value = personQuota
      tableData.value = hierarchyInfos
    }
  } catch {}
}

onMounted(() => {
  fetchInfo()
})

const personLimit = ref<number>()
const tableData = ref<HierarchyInfo[]>([])
const tableTitles = [
  { prop: 'hierarchy', name: '层级', width: 80 },
  { prop: 'account', name: '账号' },
  { prop: 'divinationConfig', name: '配置占成' },
  { prop: 'divinationActual', name: '实际占成' }
]
</script>
<template>
  <div>
    <div class="shell person-shell">
      <div class="title">个人额度</div>
      <div class="shell-content">
        <div>当前额度</div>
        <div>{{ personLimit }}</div>
      </div>
    </div>
    <div class="shell">
      <div class="title">层级占成</div>
      <el-table
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
          min-width="150"
          align="center"
          :index="index"
        />
      </el-table>
    </div>
  </div>
</template>

<style scoped lang="less">
@import url('../table.less');

.shell {
  padding: 10px;
  background: #4847600d;
  box-sizing: border-box;
}

.person-shell {
  width: 360px;
  padding: 10px;
  margin-bottom: 15px;
}

.shell-content {
  width: 100%;
  border: 1px solid #4847601a;
  border-radius: 8px;

  div {
    display: flex;
    width: 100%;
    height: 42px;
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #424251;
    background: #fff;
    align-items: center;
    justify-content: center;

    &:nth-child(1) {
      background: #c2e8ff33;
      border-radius: 8px 8px 0 0;
    }

    &:nth-child(2) {
      border-radius: 0 0 8px 8px;
    }
  }
}

.title {
  padding: 0 0 10px;
  font-family: 'Microsoft YaHei UI';
  font-size: 14px;
  line-height: 18px;
  box-sizing: border-box;
}
</style>
