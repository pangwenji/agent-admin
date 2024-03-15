<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElTabs, ElTabPane } from 'element-plus'
import { getSmartReduceGameList } from '@/api/system/reduce'

import { SmartReduceGame } from '@/api/system/reduce/types'
import ReduceOddsPanelContent from './components/ReduceOddsPanelContent.vue'

const activeName = ref('')

let lotteryTypeArray = ref<SmartReduceGame[]>([])
const initGetLotterPlay = async () => {
  try {
    const res = await getSmartReduceGameList()
    lotteryTypeArray.value = res.data
    activeName.value = res.data[0].gameCode
  } catch {}
}
onMounted(() => {
  initGetLotterPlay()
})
</script>

<template>
  <div v-loading="!lotteryTypeArray.length" class="my-reduce-odds-page">
    <ElTabs v-model="activeName">
      <ElTabPane
        v-for="lottery in lotteryTypeArray"
        :key="lottery.gameCode"
        :label="lottery.gameName"
        :name="lottery.gameCode"
        lazy
      >
        <ReduceOddsPanelContent v-if="activeName === lottery.gameCode" :lottery="lottery" />
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<style lang="less" scoped>
@import url('./index.less');
</style>
