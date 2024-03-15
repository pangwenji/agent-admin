<script setup lang="ts">
import { defineEmits, computed, defineProps } from 'vue'
import { LotteryItem } from '@/api/account/types'
import { ElSelect, ElOption, ElImage } from 'element-plus'

const props = defineProps<{
  lotteryList: LotteryItem[]
  modelValue: string | undefined
}>()
const emit = defineEmits(['update:modelValue'])

const lottery = computed(() => {
  return props.lotteryList.find((item) => item.lotteryCode === lotteryCode.value)
})

const lotteryCode = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})
</script>
<template>
  <ElSelect
    v-if="lotteryList?.length"
    v-model="lotteryCode"
    class="lottery-selector"
    :loading="!lottery"
    :fit-input-width="false"
  >
    <template #prefix>
      <ElImage class="lottery-icon" :src="lottery?.iconUrl" fit="cover" />
    </template>
    <ElOption
      v-for="item in lotteryList"
      :key="item.lotteryCode"
      class="lottery-selector-option"
      :label="item.lotteryName"
      :value="item.lotteryCode"
      popper-class="lottery-selectro-popper"
    >
      <ElImage class="lottery-icon" :src="item.iconUrl" fit="cover" />
      <span>
        {{ item.lotteryName }}
      </span>
    </ElOption>
  </ElSelect>
</template>
<style lang="less" scoped>
.lottery-selector {
  line-height: var(--common-input-height);
  box-sizing: content-box;
  :deep(.el-input) {
    --el-input-height: var(--common-input-height);
    .el-input__inner {
      width: 7em;
    }
  }
  .lottery-icon {
    float: left;
    width: calc(var(--common-input-height) * 0.7);
    height: calc(var(--common-input-height) * 0.7);
  }
}
.lottery-selectro-popper {
  --el-popper-border-radius: 6px;
}
.lottery-selector-option {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 38px;
  line-height: 38px;
  &.selected {
    font-weight: 400;
  }
  .lottery-icon {
    width: 24px;
    height: 24px;
    margin-right: 13px;
  }
}
</style>
