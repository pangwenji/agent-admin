<script setup lang="tsx">
import { defineProps } from 'vue'
import OddsTable from './OddsTable.vue'
import type { LotteryOddsItem } from '@/api/instantWager/types'
defineProps<{ trickOddsList: LotteryOddsItem[] }>()
</script>
<template>
  <div class="odds-table-list">
    <OddsTable
      v-for="trickOdds in trickOddsList"
      :key="`${trickOdds.playTypeCode}-${trickOdds.oddsListVOList?.[0].handicapCode}`"
      :trickOdds="trickOdds"
    />
  </div>
</template>
<style lang="less" scoped>
@import url('@/styles/mixins.less');
.odds-table-list {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  :deep(.el-table) {
    margin: 2px;
    .custom-table-autofit();
  }
}
</style>
