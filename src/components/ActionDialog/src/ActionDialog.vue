<script setup lang="ts">
import { ElDialog, ElScrollbar, ElButton } from 'element-plus'
import { computed, ref, useSlots, withDefaults } from 'vue'
import { isNumber } from '@/utils/is'

interface IProps {
  close: () => void
  confirm?: () => Promise<undefined | boolean>
  maxHeight?: number | string
  title?: string
  headerStyle?: any
}

const props = withDefaults(defineProps<IProps>(), {
  title: '操作确认',
  maxHeight: '35vh',
  confirm: undefined,
  headerStyle: undefined
})

const dialogStyle = computed(() => {
  return {
    maxHeight: isNumber(props.maxHeight) ? `${props.maxHeight}px` : props.maxHeight,
    overflow: 'auto'
  }
})

const confirming = ref(false)
const handleConfirm = async () => {
  if (typeof props.confirm !== 'function') return
  confirming.value = true
  const success = await props.confirm()
  if (success) {
    props.close()
  }
  confirming.value = false
}
const slots = useSlots()
</script>

<template>
  <ElDialog
    :width="450"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="!confirming"
    destroy-on-close
    lock-scroll
    :draggable="false"
    :title="props.title"
    class="my-action-dialog"
  >
    <ElScrollbar :style="dialogStyle">
      <slot></slot>
    </ElScrollbar>
    <template #footer>
      <slot v-if="slots.footer" name="footer"></slot>
      <template v-else>
        <ElButton v-if="props.confirm" type="primary" :loading="confirming" @click="handleConfirm">
          确认
        </ElButton>
        <ElButton :disabled="confirming" type="info" @click="props.close">取消</ElButton>
      </template>
    </template>
  </ElDialog>
</template>

<style lang="less">
@import url('@/styles/mixins.less');

.my-action-dialog {
  * {
    box-sizing: border-box;
  }
  --el-dialog-border-radius: 10px;
  .el-dialog__header {
    .custom-dialog > .header;
  }
  .el-dialog__body {
    .custom-dialog > .content;
  }
  .el-dialog__footer {
    .custom-dialog > .footer;
  }
}
</style>
