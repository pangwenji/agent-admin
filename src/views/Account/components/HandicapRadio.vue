<script setup lang="ts">
import { computed, PropType, defineEmits, watch } from 'vue'
import { propTypes } from '@/utils/propTypes'
import { ElRadioGroup, ElRadioButton } from 'element-plus'
import type { LotteryHandicapItem } from '@/api/account/types'

const props = defineProps({
  list: {
    type: Array as PropType<LotteryHandicapItem[]>,
    default: () => []
  },
  modelValue: propTypes.string.def('')
})

const radioValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

watch(
  () => props.list,
  (value) => {
    if (value?.length) {
      const codeList = value.map((item) => item.handicapCode)
      // 已有值并且存在在盘口列表中
      if (props.modelValue && codeList.includes(props.modelValue)) {
        radioValue.value = props.modelValue
      } else {
        // 默认设置为第一个盘口
        radioValue.value = value[0].handicapCode
      }
    }
  }
)

const onChange = (val: string) => {
  emit('change', val)
}

const emit = defineEmits(['change', 'update:modelValue'])
</script>
<template>
  <ElScrollbar class="flex-shrink mr-2">
    <ElRadioGroup v-if="radioValue" v-model="radioValue" @change="onChange">
      <ElRadioButton v-for="item in list" :key="item.handicapCode" :label="item.handicapCode">
        {{ item.handicapName }}
      </ElRadioButton>
    </ElRadioGroup>
  </ElScrollbar>
</template>

<style scoped lang="less">
@import url('@/styles/mixins.less');
:deep(.el-radio-group) {
  .ghost-radio-button-group();
}
</style>
