<script lang="ts" setup>
import { formatNumPadding } from '@/hooks/web/useInstantWager'
import { defineProps, computed, watch, ref } from 'vue'
import useOddsTable from '../hooks/useOddsTable'
import { LotteryDrawItem } from '@/api/drawingResult/types'

const { isLHC, isRed, isBlue, isGreen, getNumAnimalMap } = useOddsTable()

const props = defineProps<{ drawInfo: LotteryDrawItem }>()

const lotteryCode = computed(() => {
  return props.drawInfo?.lotteryCode
})
const drawingResult = computed(() => {
  return props.drawInfo?.drawingResult
})
const animalMap = computed(() => {
  return props.drawInfo?.startBillTime && getNumAnimalMap(props.drawInfo.startBillTime)
})

// const SumTypes = ['JNDEB', 'PCNN', 'PCBJL', 'JNDSI', 'JNDWU', 'JNDWP', 'JNDSSC']
const SpecialNumTypes = ['XGLHC', 'QXC', 'JNDLHC']

const specialNum = ref<number>()
const isSpecialNumType = computed(() => {
  return !!lotteryCode.value && SpecialNumTypes.includes(lotteryCode.value)
})
const numList = computed(() => {
  const list = drawingResult.value?.split(',').map(Number) || []
  if (isSpecialNumType.value) {
    list.pop()
  }
  return list
})

watch(
  drawingResult,
  (result) => {
    if (result && isSpecialNumType) {
      specialNum.value = result.split(',').map(Number).pop()
    }
  },
  { immediate: true }
)
</script>
<template>
  <div
    v-if="lotteryCode && numList.length"
    :class="['draw-result', { 'lhc-result': isLHC(lotteryCode) }]"
  >
    <template v-for="(num, index) in numList" :key="index">
      <span class="num-container">
        <span
          :class="[
            'draw-num',
            {
              'lhc-red': isLHC(lotteryCode) && isRed(num),
              'lhc-blue': isLHC(lotteryCode) && isBlue(num),
              'lhc-green': isLHC(lotteryCode) && isGreen(num)
            }
          ]"
        >
          {{ formatNumPadding(num) }}
        </span>
        <span v-if="isLHC(lotteryCode) && animalMap" class="animal-code">
          {{ animalMap.get(num) }}
        </span>
      </span>
      <span v-if="!isSpecialNumType && index < numList.length - 1" class="draw-operator">+</span>
    </template>
    <span v-if="isLHC(lotteryCode)" class="lhc-special num-container">
      <span
        :class="[
          'draw-num',
          {
            'lhc-red': isLHC(lotteryCode) && isRed(specialNum!),
            'lhc-blue': isLHC(lotteryCode) && isBlue(specialNum!),
            'lhc-green': isLHC(lotteryCode) && isGreen(specialNum!)
          }
        ]"
      >
        {{ formatNumPadding(specialNum!) }}
      </span>
      <span v-if="animalMap" class="animal-code">
        {{ animalMap.get(specialNum) }}
      </span>
    </span>
    <span v-else-if="isSpecialNumType" class="draw-num special-num green-special-num">{{
      formatNumPadding(specialNum!)
    }}</span>

    <span v-else class="draw-operator">=</span>
    <span v-if="!isSpecialNumType" class="draw-num special-num">
      {{
        formatNumPadding(
          numList?.reduce((res, num) => {
            return res + num
          }, 0)
        )
      }}
    </span>
  </div>
</template>
<style lang="less" scoped>
@import url('@/styles/mixins.less');
@color: #008ddc;
@size: 24px;
.draw-result {
  display: flex;
  &.lhc-result {
    .num-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      .animal-code {
        font-size: 12px;
      }
    }
    .lhc-common();
    .lhc-special {
      .lhc-special();
    }
  }
}
.draw-num {
  display: inline-block;
  flex-shrink: 0;
  border: 2px solid #c2e8ff;
  width: @size;
  height: @size;
  line-height: @size;
  text-align: center;
  border-radius: 50%;
  font-size: 12px;
  color: @color;
  margin-inline: 3px;
  &.special-num {
    color: #fff;
    background-color: @color;
    margin-right: 0;
    &.green-special-num {
      background-color: var(--el-color-success);
    }
  }
}
.draw-operator {
  color: @color;
  font-size: 16px;
  height: @size;
  line-height: @size;
}
</style>
