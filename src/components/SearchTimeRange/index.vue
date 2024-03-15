<script lang="ts">
import { ElSelect, ElDatePicker, ElOption } from 'element-plus'
import { defineComponent, reactive, ref, PropType, computed, watch, unref } from 'vue'
import { DefaultTimeType, getDefaultTimeRange, getDefaultTimeType } from './tools'

export default defineComponent({
  name: 'SearchTimeRange',
  components: {
    ElSelect,
    ElDatePicker,
    ElOption
  },
  props: {
    modelValue: {
      type: Object as PropType<[Date, Date]>,
      default: undefined
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const proxyAccount = ref()

    const bettingTime = ref(0)

    const shortcutTime = ref(3)

    const timeRange = computed({
      get() {
        return props.modelValue
      },
      set(val) {
        emit('update:modelValue', val)
      }
    })

    const options = reactive([{ label: '投注时间', value: 0 }])

    const shortcutTimeOptions = reactive([
      { label: '快捷时间', value: DefaultTimeType.None },
      {
        label: '今天',
        value: DefaultTimeType.Today
      },
      {
        label: '本周',
        value: DefaultTimeType.Week
      },
      {
        label: '本月',
        value: DefaultTimeType.Month
      }
    ])

    const change = () => {
      timeRange.value = getDefaultTimeRange(shortcutTime.value)
    }

    // 同步快捷时间选项
    watch(
      () => unref(timeRange),
      (newTimeRange) => {
        shortcutTime.value = getDefaultTimeType(newTimeRange)
      },
      {
        deep: true,
        immediate: true
      }
    )

    return {
      proxyAccount,
      bettingTime,
      shortcutTime,
      timeRange,
      options,
      shortcutTimeOptions,
      change
    }
  }
})
</script>

<template>
  <div class="container">
    <ElSelect v-model="bettingTime" :popper-append-to-body="false" class="custom-select">
      <ElOption
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        class="options"
      />
    </ElSelect>
    <ElDatePicker
      v-model="timeRange"
      type="datetimerange"
      range-separator="-"
      unlink-panels
      start-placeholder="开始时间"
      end-placeholder="结束时间"
    />
    <ElSelect
      v-model="shortcutTime"
      :popper-append-to-body="false"
      class="right-select"
      @change="change"
    >
      <ElOption
        v-for="item in shortcutTimeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </ElSelect>
  </div>
</template>

<style lang="less" scoped>
:deep(.custom-select .el-input__wrapper) {
  width: 120px;
  height: 32px;
  border-radius: 8px 0 0 8px;
  box-sizing: border-box;
}

:deep(.right-select .el-input__wrapper) {
  width: 120px;
  height: 32px;
  border-radius: 0 8px 8px 0;
  margin-left: -1px;
  box-sizing: border-box;
}

:deep(.el-range-editor.el-input__wrapper) {
  height: 32px;
  border-radius: 0;
  box-shadow: none;
  margin-left: -1px;
  box-sizing: border-box;
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: none;
  }
}

.container {
  display: flex;
  align-items: center;
  :deep(.el-input__wrapper) {
    box-shadow: none;
    border: 1px var(--el-border-color) solid;
    &:hover,
    &.is-focus {
      border-color: var(--el-color-primary);
      z-index: 1;
      box-shadow: none !important;
    }
  }
}

.date-input {
  width: 50px;
  background: red;
}
</style>
