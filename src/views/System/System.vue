<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { ElTabs, ElTabPane } from 'element-plus'
import { useAgentInfoStore } from '@/store/modules/agentInfo'

import SystemSettings from './SystemSettings/SystemSettings.vue'
import LogPage from './LogPage/LogPage.vue'
import MessageCenter from './MessageCenter/MessageCenter.vue'
import ReduceOddsPage from './ReduceOddsPage/ReduceOddsPage.vue'

const loading = ref(true)
const agentInfoStore = useAgentInfoStore()

const isRoot = computed(() => {
  return !!(agentInfoStore?.info?.id && Number(agentInfoStore.info.agentType) === 0)
})
const activeName = ref(isRoot.value ? 'config' : 'log')

watch(isRoot, (newIsRoot) => {
  if (newIsRoot) {
    activeName.value = 'log'
  }
})
onMounted(async () => {
  try {
    if (!agentInfoStore?.info?.account) {
      await agentInfoStore.getAgentInfo()
    }
    loading.value = false
  } catch (error) {}
})
</script>
<template>
  <ElTabs v-model="activeName" v-loading="loading" type="card" class="system-tabs">
    <ElTabPane v-if="isRoot" label="系统配置" name="config">
      <SystemSettings v-if="activeName === 'config'" />
    </ElTabPane>
    <ElTabPane v-if="isRoot" lazy label="智能降赔" name="reduce">
      <ReduceOddsPage v-if="activeName === 'reduce'" />
    </ElTabPane>
    <ElTabPane lazy label="日志管理" name="log">
      <LogPage v-if="activeName === 'log'" />
    </ElTabPane>
    <ElTabPane v-if="isRoot" lazy label="消息中心" name="msg">
      <MessageCenter v-if="activeName === 'msg'" />
    </ElTabPane>
  </ElTabs>
</template>
<style lang="less" scoped>
@import url('@/styles/mixins.less');
.system-tabs {
  .common-tabs();
}
</style>
