<script setup lang="ts">
import { defineEmits, computed, defineProps, watch } from 'vue'
import { ElScrollbar, ElSelect, ElOption, ElRadioGroup, ElRadioButton } from 'element-plus'

import { formatLHCLotteryTricksList } from '@/hooks/web/useInstantWager'

import type { LotteryTrickItem } from '@/api/instantWager/types'

const props = defineProps<{
  trickList: LotteryTrickItem[]
  lotteryCode: string | undefined
  modelValue: string | undefined
}>()
const emit = defineEmits(['update:modelValue'])

// 玩法
const currentTrick = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})
// 处理玩法下拉框
const trickBtnList = computed(() => {
  if (props.lotteryCode?.endsWith('LHC') && props.trickList?.length) {
    return formatLHCLotteryTricksList(props.trickList)
  }
  return props.trickList
})
const handleTrickSelect = (val) => {
  emit('update:modelValue', val)
}
watch(
  () => props.trickList,
  (list, oldList) => {
    if (list?.length) {
      const isSameLottery = list[0].lotteryCode === oldList?.[0]?.lotteryCode
      const codeList = list.map((item) => item.playTypeCode)
      // 同一个彩票已经选择了玩法，则不重置
      if (isSameLottery && currentTrick.value && codeList.includes(currentTrick.value)) {
        return
      }
      currentTrick.value = list[0].playTypeCode
    }
  }
)

const getTrickSelectProps = (options: LotteryTrickItem[]) => {
  if (options.find((item) => item.playTypeCode === currentTrick.value)) {
    return {
      modelValue: currentTrick.value
    }
  }
  return {}
}
</script>
<template>
  <ElScrollbar class="tricks-btn-group">
    <ElRadioGroup v-if="trickBtnList?.length" v-model="currentTrick">
      <ElRadioButton
        v-for="trick in trickBtnList"
        :key="trick.playTypeCode"
        :label="
          trick.options?.find((item) => item.playTypeCode === currentTrick)?.playTypeCode ||
          trick.playTypeCode
        "
        :class="{
          'trick-selector-container': !!trick.options?.length
        }"
      >
        <ElSelect
          v-if="trick.options?.length"
          v-bind="getTrickSelectProps(trick.options)"
          class="w-22"
          :fit-input-width="false"
          :placeholder="trick.playTypeName"
          @change="handleTrickSelect"
          @click.stop.prevent="() => {}"
        >
          <ElOption
            v-for="item in trick.options"
            :key="item.playTypeCode"
            :label="item.playTypeName"
            :value="item.playTypeCode"
          />
        </ElSelect>
        <span v-else>{{ trick.playTypeName }}</span>
      </ElRadioButton>
    </ElRadioGroup>
  </ElScrollbar>
</template>
<style lang="less" scoped>
@import url('@/styles/mixins.less');
.tricks-btn-group {
  white-space: nowrap;
  :deep(.el-scrollbar__view) {
    --el-border-radius-base: 6px;

    .el-radio-group {
      flex-wrap: nowrap;
      .ghost-radio-button-group();
    }
    .el-radio-button__inner {
      display: flex;
      align-items: center;
      justify-content: center;
      height: var(--common-input-height);
      padding: 0 1em;
    }
    .trick-selector-container {
      .el-radio-button__inner {
        padding-inline: 0;
      }
      .el-input__wrapper {
        --el-input-height: var(--common-input-height);
        // border: none;
        border-radius: 0;
        box-shadow: none;
        background-color: transparent;
        &.is-focus {
          box-shadow: none !important;
        }
        .el-input__inner {
          color: var(--el-radio-button-checked-bg-color, var(--el-color-primary));
        }
      }
    }
  }
}
</style>
