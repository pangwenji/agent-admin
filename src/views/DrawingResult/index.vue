<script lang="ts" setup>
import { ref } from 'vue'
import { ElTabs, ElTabPane } from 'element-plus'

import LotteryResults from './LotteryResults/index.vue'
// import SportsResults from './SportsResults/index.vue'
// import VideoResults from './VideoResults/index.vue'

const activeName = ref('lottery')
</script>
<template>
  <ElTabs v-model="activeName" type="card" class="drawing-result-tabs">
    <ElTabPane label="彩票" name="lottery">
      <LotteryResults v-if="activeName === 'lottery'" />
    </ElTabPane>
    <!-- <ElTabPane lazy label="体育" name="sports">
      <SportsResults v-if="activeName === 'sports'" />
    </ElTabPane> -->
    <!-- <ElTabPane lazy label="视讯" name="video">
      <VideoResults v-if="activeName === 'video'" />
    </ElTabPane> -->
  </ElTabs>
</template>
<style lang="less" scoped>
@import url('@/styles/mixins.less');
.drawing-result-tabs {
  .common-tabs();
}
</style>
