<script setup lang="ts">
import { ref, defineProps } from 'vue'
import LongConfigList from './LongConfigList.vue'

import { SmartReduceConfigType, SmartReduceGame } from '@/api/system/reduce/types'
import AmountConfigList from './AmountConfigList.vue'

const props = defineProps<{ lottery: SmartReduceGame }>()
const configTexts = {
  [SmartReduceConfigType.Long]: '长龙配置',
  [SmartReduceConfigType.Amount]: '虚注金额配置'
}
const configType = ref(
  props.lottery.isSmart ? SmartReduceConfigType.Long : SmartReduceConfigType.Amount
)
console.log('configType => ', configType.value)
</script>

<template>
  <ElRadioGroup v-model="configType">
    <ElRadioButton v-if="lottery.isSmart" :label="SmartReduceConfigType.Long">
      {{ configTexts[SmartReduceConfigType.Long] }}
    </ElRadioButton>
    <ElRadioButton :label="SmartReduceConfigType.Amount">
      {{ configTexts[SmartReduceConfigType.Amount] }}
    </ElRadioButton>
  </ElRadioGroup>
  <LongConfigList v-if="configType === SmartReduceConfigType.Long" :gameCode="lottery.gameCode" />
  <AmountConfigList
    v-if="configType === SmartReduceConfigType.Amount"
    :gameCode="lottery.gameCode"
  />
</template>
