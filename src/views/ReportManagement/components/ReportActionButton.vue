<template>
  <ElButton :type="disabled ? 'text' : 'primary'" :link="!disabled" :disabled="disabled">
    <slot></slot>
  </ElButton>
</template>
<script lang="ts" setup>
import { ReportRecordItem } from '@/api/reportManagement/types'
import { ElButton } from 'element-plus'
import { computed, defineProps } from 'vue'
import type { ButtonHTMLAttributes } from 'vue'

interface Props extends /** @vue-ignore */ ButtonHTMLAttributes {
  row: ReportRecordItem
}

const props = defineProps<Props>()

const disabled = computed(() => {
  return !props.row?.hasDownLine
})
</script>
