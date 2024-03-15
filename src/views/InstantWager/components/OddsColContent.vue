<script setup lang="ts">
import { inject, ref, onUnmounted, defineProps, watch } from 'vue'
import { InstantWagerRootKey, InstantWagerCalStep, calFloatNum } from '@/hooks/web/useInstantWager'
import { InstantWagerInjectData, OddsListVOListItem } from '@/api/instantWager/types'

const props = defineProps<{ row: OddsListVOListItem }>()
const { handleCalInTable, isOddsOpen } = inject<InstantWagerInjectData>(InstantWagerRootKey)!

const blinking = ref(false)
let timer: NodeJS.Timeout
const clearTimer = () => {
  timer && clearTimeout(timer)
}
const startTimer = () => {
  clearTimer()
  blinking.value = true
  const duration = 3000
  timer = setTimeout(() => {
    blinking.value = false
  }, duration)
}

onUnmounted(() => {
  clearTimer()
})

watch(
  () => props.row.odds,
  () => {
    startTimer()
  }
)
</script>
<template>
  <div
    :class="[
      'flex justify-center items-center w-full h-full',
      {
        blinking: blinking
      }
    ]"
  >
    <ElButton
      v-if="isOddsOpen"
      type="primary"
      text
      @click.stop="
        () => {
          handleCalInTable(row, calFloatNum(row.odds, InstantWagerCalStep))
        }
      "
    >
      +
    </ElButton>
    <span>{{ parseFloat(`${row.odds}`).toFixed(3) }}</span>
    <ElButton
      v-if="isOddsOpen"
      type="danger"
      text
      class="px-3"
      @click.stop="
        () => {
          handleCalInTable(row, calFloatNum(row.odds, -1 * InstantWagerCalStep))
        }
      "
    >
      -
    </ElButton>
  </div>
</template>
<style lang="less" scoped>
.blinking {
  animation: blinker 1s linear infinite;
  box-shadow: inset 0px 0px 5px 2px rgba(74, 191, 250, 0.43);
}
@keyframes blinker {
  50% {
    opacity: 0.5;
  }
}
</style>
