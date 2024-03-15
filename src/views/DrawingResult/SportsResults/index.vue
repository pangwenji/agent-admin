<script setup lang="tsx">
/* eslint-disable no-magic-numbers */
import { ref, onMounted } from 'vue'
import { ElRadioButton } from 'element-plus'

import SoccerList from './components/SoccerList.vue'
import BasketballList from './components/BasketballList.vue'

const sportList = ref([{ label: '足球' }, { label: '篮球' }])
/* const initGetLotterPlay = async () => {
  const res = await getLotteryListApi()
  sportList.value = res.data
  currentSport.value = res.data[0].lotteryCode
} */

const currentSport = ref<string>('足球')

onMounted(() => {
  // initGetLotterPlay()
})
</script>

<template>
  <ElRadioGroup v-model="currentSport" class="lottery-radio">
    <ElRadioButton v-for="sport in sportList" :key="sport.label" :label="sport.label">
      {{ sport.label }}
    </ElRadioButton>
  </ElRadioGroup>
  <SoccerList v-if="currentSport === '足球'" />
  <BasketballList v-if="currentSport === '篮球'" />
</template>
<style lang="less" scoped>
.lottery-radio {
  margin: 0 16px 16px 0;
  flex-wrap: nowrap;
  overflow-x: auto;
}
</style>
